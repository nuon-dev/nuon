import express from "express"
import { decodeJumoaToken, getUserFromToken } from "../util/util"
import { userDatabase } from "../model/dataSource"
import { User } from "../entity/user"
import userModel from "../model/user"
import {
  getKakaoIdFromAccessToken,
  getKakaoTokenFromAuthCode,
  getJumoaTokenFromAuthCode,
  sendLoginDataToClient,
} from "../util/auth"

const router = express.Router()

/**
 * Todo: 클라이언트에서 isSuperUser true 날리면 그냥 해줄겨? 아주 그냥...ㅎ 바꾸기
 */
router.post("/edit-my-information", async (req, res) => {
  const me = await getUserFromToken(req)
  if (!me) {
    res.status(401).send({ result: "fail" })
    return
  }

  const user = req.body as User

  if (user.id !== me.id) {
    res.status(401).send({ result: "fail" })
    return
  }

  const allowedUpdate: Partial<User> = {
    name: user.name,
    yearOfBirth: user.yearOfBirth,
    gender: user.gender,
    phone: user.phone,
    etc: user.etc,
    profile: user.profile,
  }

  await userDatabase.update({ id: me.id }, allowedUpdate)
  res.send({ result: "success" })
})

router.post("/receipt-record", async (req, res) => {
  const body = req.body

  const kakaoId = body.kakaoId

  const foundUser = await userModel.getUSerFromKakaoId(kakaoId)
  if (foundUser) {
    const newUserToken = await userModel.loginFromUser(foundUser)
    res
      .cookie("refreshToken", newUserToken.refreshToken, { httpOnly: true })
      .send({ result: "success", accessToken: newUserToken.accessToken })
    return
  }

  const createdUserToken = await userModel.registerNewUser(kakaoId)
  res
    .cookie("refreshToken", createdUserToken.refreshToken, { httpOnly: true })
    .send({ result: "success", accessToken: createdUserToken.accessToken })
})

router.post("/login", async (req, res) => {
  const { kakaoToken } = req.body

  const kakaoId = await getKakaoIdFromAccessToken(kakaoToken as string)
  if (!kakaoId) {
    res.status(404).send({ result: "fail" })
    return
  }

  const foundUser = await userModel.getUSerFromKakaoId(kakaoId)
  if (!foundUser) {
    res.status(404).send({ result: "fail" })
    return
  }

  await sendLoginDataToClient(res, foundUser)
})

router.post("/get-kakao-token", async (req, res) => {
  const { code } = req.body

  const kakaoToken = await getKakaoTokenFromAuthCode(code as string)
  if (!kakaoToken) {
    res.status(404).send({ result: "fail" })
    return
  }

  res.send({ result: "success", kakaoToken: kakaoToken })
})

router.post("/login-from-jumoa-code", async (req, res) => {
  const { code } = req.body as { code?: unknown }
  if (typeof code !== "string" || !code) {
    res.status(400).send({ result: "fail", message: "인증 코드가 필요합니다." })
    return
  }

  try {
    const { access_token, expires_in, refresh_token, scope, token_type } =
      await getJumoaTokenFromAuthCode(code)

    const payload = decodeJumoaToken(access_token)
    if (!payload) {
      res.status(400).send({
        result: "fail",
        message: "주모아 토큰이 유효하지 않습니다.",
      })
      return
    }

    const foundUserFromJumoaId = await userDatabase.findOne({
      where: { jumoaId: payload.sub },
    })

    if (foundUserFromJumoaId) {
      await sendLoginDataToClient(res, foundUserFromJumoaId)
      return
    }

    const jumoaData = await userModel.getJumoaDataFromJumoaToken(access_token)

    if (!jumoaData) {
      res.status(404).send({
        result: "fail",
        message: "주모아 계정과 연결된 사용자가 없습니다.",
        accessToken: access_token,
        refreshToken: refresh_token,
      })
      return
    }

    const foundUserFromJumoaData = await userDatabase.findOne({
      where: {
        name: jumoaData.name,
        phone: jumoaData?.mobile,
      },
    })

    if (foundUserFromJumoaData) {
      foundUserFromJumoaData.jumoaId = payload.sub
      await userDatabase.save(foundUserFromJumoaData)
      await sendLoginDataToClient(res, foundUserFromJumoaData)
      return
    }

    res.status(404).send({
      result: "fail",
      message: "주모아 계정과 연결된 사용자가 없습니다.",
      accessToken: access_token,
      refreshToken: refresh_token,
    })
    return
  } catch (error) {
    res
      .status(502)
      .send({ result: "fail", message: "주모아 로그인에 실패했습니다." })
  }
})

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.status(403).send({ success: false })
    return
  }

  const foundUser = await userModel.getUserFromRefreshToken(refreshToken)
  if (!foundUser) {
    res.status(404).send({ result: "fail" })
    return
  }

  await sendLoginDataToClient(res, foundUser)
})

router.post("/bind-jumoa-with-kakao", async (req, res) => {
  const { kakaoToken, jumoaToken } = req.body

  if (!kakaoToken || !jumoaToken) {
    res.status(400).send({
      result: "fail",
      message: "카카오 토큰과 주모아 토큰이 필요합니다.",
    })
    return
  }

  const kakaoId = await getKakaoIdFromAccessToken(kakaoToken as string)
  if (!kakaoId) {
    res
      .status(404)
      .send({ result: "fail", message: "유효하지 않은 카카오 토큰입니다." })
    return
  }

  const jumoaData = await userModel.getJumoaDataFromJumoaToken(jumoaToken)
  if (!jumoaData) {
    res
      .status(404)
      .send({ result: "fail", message: "유효하지 않은 주모아 토큰입니다." })
    return
  }

  const foundUser = await userDatabase.findOne({ where: { kakaoId: kakaoId } })
  if (!foundUser) {
    res.status(404).send({
      result: "fail",
      message: "카카오 계정과 연결된 사용자가 없습니다.",
    })
    return
  }

  foundUser.jumoaId = jumoaData.id
  await userDatabase.save(foundUser)
  res.send({
    result: "success",
    message: "카카오 계정과 주모아 계정이 연동되었습니다.",
  })
})

export default router

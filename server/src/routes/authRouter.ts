import express from "express"
import { getUserFromToken } from "../util/util"
import { communityDatabase } from "../model/dataSource"
import { User } from "../entity/user"
import userModel from "../model/user"

const router = express.Router()

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

  await userModel.updateUserData(user)
  res.send({ result: "success" })
})

router.get("/community", async (req, res) => {
  const communityList = await communityDatabase.find()
  res.send(communityList)
})

router.post("/receipt-record", async (req, res) => {
  const body = req.body

  const kakaoId = body.kakaoId
  const newUserToken = await userModel.loginFromKakaoId(kakaoId)
  if (newUserToken) {
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
  const body = req.body

  const kakaoId = body.kakaoId

  const newUserToken = await userModel.loginFromKakaoId(kakaoId)
  if (!newUserToken) {
    res.status(401).send({ result: "fail" })
    return
  }

  const twentyOneDays = 1000 * 60 * 60 * 24 * 21
  res
    .header("Access-Control-Allow-Credentials", "true")
    .cookie("refreshToken", newUserToken.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + twentyOneDays),
    })
    .send({ result: "success", accessToken: newUserToken.accessToken })
})

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.status(401).send({ success: false })
    return
  }

  const tokenResult = await userModel.createNewAccessToken(refreshToken)
  if (!tokenResult.success) {
    res.status(401).send({ result: "fail" })
    return
  }

  res
    .cookie("refreshToken", tokenResult.refreshToken, { httpOnly: true })
    .send({ result: "success", accessToken: tokenResult.accessToken })
})

export default router

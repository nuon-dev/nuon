import express from "express"
import { getUserFromToken, isTokenExpire } from "../util"
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

router.post("/check-token", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "false" })
    return
  }

  if (isTokenExpire(foundUser.expire)) {
    res.send({ result: "false" })
    return
  }

  res.send({
    result: "true",
    userData: {
      id: foundUser.id,
      gender: foundUser.gender,
      name: foundUser.name,
      yearOfBirth: foundUser.yearOfBirth,
      phone: foundUser.phone,
      community: foundUser.community,
      profile: foundUser.profile,
    },
  })
})

router.get("/community", async (req, res) => {
  const communityList = await communityDatabase.find()
  res.send(communityList)
})

router.post("/receipt-record", async (req, res) => {
  const body = req.body

  const kakaoId = body.kakaoId
  const foundUserToken = await userModel.loginFromKakaoId(kakaoId)
  if (foundUserToken) {
    res.send({ result: "success", token: foundUserToken })
    return
  }

  const createdUserToken = await userModel.registerNewUser(kakaoId)
  res.send({ result: "success", token: createdUserToken })
})

router.post("/login", async (req, res) => {
  const body = req.body

  const kakaoId = body.kakaoId

  const foundUserToken = await userModel.loginFromKakaoId(kakaoId)
  if (!foundUserToken) {
    res.status(401).send({ result: "fail" })
    return
  }

  res.send({ result: "success", token: foundUserToken })
})

export default router

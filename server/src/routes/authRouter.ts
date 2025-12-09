import express from "express"
import { getUserFromToken, hashCode, isTokenExpire } from "../util"
import { communityDatabase, userDatabase } from "../model/dataSource"
import { User } from "../entity/user"

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

  await userDatabase.save(user)
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
  const foundUser = await userDatabase.findOneBy({
    kakaoId: kakaoId,
  })

  if (foundUser) {
    foundUser.token = hashCode(foundUser.kakaoId + new Date().getTime())
    const expireDay = new Date()
    expireDay.setDate(expireDay.getDate() + 21)
    foundUser.expire = expireDay
    await userDatabase.save(foundUser)
    res.send({ token: foundUser.token })
  } else {
    const now = new Date()
    const createUser = new User()
    createUser.kakaoId = kakaoId
    createUser.createAt = new Date()
    createUser.gender = ""
    createUser.token = hashCode(kakaoId + now.getTime().toString())
    createUser.expire = new Date(now.setDate(now.getDate() + 7))
    await userDatabase.save(createUser)
    res.send({ token: createUser.token })
  }
})

router.post("/login", async (req, res) => {
  const body = req.body

  const kakaoId = body.kakaoId
  const foundUser = await userDatabase.findOneBy({
    kakaoId: kakaoId,
  })

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  foundUser.token = hashCode(foundUser.kakaoId + new Date().getTime())
  const expireDay = new Date()
  expireDay.setDate(expireDay.getDate() + 21)
  foundUser.expire = expireDay
  await userDatabase.save(foundUser)
  res.send({ result: "success", token: foundUser.token })
})

export default router

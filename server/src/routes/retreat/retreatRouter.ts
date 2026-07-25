import express from "express"
import {
  communityDatabase,
  retreatAttendDatabase,
  userDatabase,
} from "../../model/dataSource"
import { getUserFromToken } from "../../util/util"
import adminRouter from "./adminRouter"
import sharingRouter from "./sharingRouter"
import { getKakaoIdFromAccessToken } from "../../util/auth"
import { IsNull } from "typeorm"

const router = express.Router()

router.get("/", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  var retreatAttend = await retreatAttendDatabase.findOne({
    where: {
      user: {
        id: foundUser.id,
      },
    },
    relations: {
      user: true,
    },
    select: {
      id: true,
      user: {
        id: true,
        name: true,
        phone: true,
        yearOfBirth: true,
      },
      isDeposited: true,
      howToGo: true,
      howToBack: true,
      isCanceled: true,
      etc: true,
      attendanceNumber: true,
    },
  })

  if (!retreatAttend) {
    retreatAttend = retreatAttendDatabase.create({
      user: {
        id: foundUser.id,
      },
    })
    await retreatAttendDatabase.save(retreatAttend)
  }

  res.json(retreatAttend)
})

interface JoinNuonRequest {
  kakaoToken: string
  name: string
  yearOfBirth: number
  gender: "man" | "woman"
  phone: string
}

router.post("/join", async (req, res) => {
  const retreatAttend: JoinNuonRequest = req.body

  const kakaoId = await getKakaoIdFromAccessToken(retreatAttend.kakaoToken)

  const foundUser = await userDatabase.findOne({
    where: {
      kakaoId: kakaoId,
    },
  })

  if (foundUser) {
    res
      .status(409)
      .send({ result: "fail", message: "이미 등록된 사용자입니다." })
    return
  }

  const foundUserByPhoneAndName = await userDatabase.findOne({
    where: {
      phone: retreatAttend.phone,
      name: retreatAttend.name,
      gender: retreatAttend.gender,
    },
  })

  if (foundUserByPhoneAndName) {
    foundUserByPhoneAndName.kakaoId = kakaoId
    await userDatabase.save(foundUserByPhoneAndName)
    res.send({ result: "success" })
    return
  }

  const newUser = await userDatabase.create({
    kakaoId: kakaoId,
    name: retreatAttend.name,
    yearOfBirth: retreatAttend.yearOfBirth,
    gender: retreatAttend.gender,
    phone: retreatAttend.phone,
  })
  await userDatabase.save(newUser)

  res.send({ result: "success" })
})

router.post("/attend", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const foundRetreatAttend = await retreatAttendDatabase.findOne({
    where: {
      user: {
        id: foundUser.id,
      },
    },
  })

  if (foundRetreatAttend) {
    foundRetreatAttend.isHalf = req.body.isHalf
    foundRetreatAttend.isWorker = req.body.isWorker
    await retreatAttendDatabase.save(foundRetreatAttend)
    res.send({ result: "수련회 정보가 수정 되었습니다." })
    return
  }

  const { isHalf, isWorker } = req.body
  const retreatAttend = retreatAttendDatabase.create({
    user: {
      id: foundUser.id,
    },
    isHalf: isHalf,
    isWorker: isWorker,
  })
  retreatAttend.attendanceNumber = (await retreatAttendDatabase.count()) + 1
  await retreatAttendDatabase.save(retreatAttend)
  res.send({ result: "수련회 정보가 등록 되었습니다." })
})

router.post("/bind", async (req, res) => {
  const { phone, kakaoToken } = req.body

  const foundUser = await userDatabase.findOne({
    where: {
      phone: phone as string,
      kakaoId: IsNull(),
    },
  })

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const kakaoId = await getKakaoIdFromAccessToken(kakaoToken as string)
  foundUser.kakaoId = kakaoId
  await userDatabase.save(foundUser)
  res.send({ result: "success" })
})

router.get("/isRegistered", async (req, res) => {
  const { phone } = req.query

  const foundUser = await userDatabase.findOne({
    where: {
      phone: phone as string,
    },
  })

  if (!foundUser) {
    res.status(404).send({ result: "fail" })
    return
  }

  res.send({ result: foundUser ? "success" : "fail" })
})

router.use("/sharing", sharingRouter)
router.use("/admin", adminRouter)

export default router

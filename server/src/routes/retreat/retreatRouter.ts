import express from "express"
import {
  communityDatabase,
  retreatAttendDatabase,
  userDatabase,
} from "../../model/dataSource"
import { getUserFromToken } from "../../util/util"
import adminRouter from "./adminRouter"
import sharingRouter from "./sharingRouter"

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
  kakaoId: string
  name: string
  yearOfBirth: number
  gender: "man" | "woman"
  phone: string
}

router.post("/join", async (req, res) => {
  const retreatAttend: JoinNuonRequest = req.body

  const foundUser = await userDatabase.findOne({
    where: {
      kakaoId: retreatAttend.kakaoId,
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
    foundUserByPhoneAndName.kakaoId = retreatAttend.kakaoId
    await userDatabase.save(foundUserByPhoneAndName)
    res.send({ result: "success" })
    return
  }

  const newUser = await userDatabase.create({
    kakaoId: retreatAttend.kakaoId,
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

router.post("/set-postcard-content", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const { content, targetUserId } = req.body

  const foundRetreatAttend = await retreatAttendDatabase.findOne({
    where: {
      user: {
        id: targetUserId,
      },
    },
    relations: {
      user: true,
    },
  })

  if (foundRetreatAttend) {
    foundRetreatAttend.postcardContent = content
    await retreatAttendDatabase.save(foundRetreatAttend)
    res.send({ result: "success" })
    return
  }

  const community = await communityDatabase.findOne({
    where: {
      users: {
        id: targetUserId,
      },
    },
    relations: {
      users: true,
      leader: true,
      deputyLeader: true,
    },
  })

  if (!community) {
    res.status(404).send({ result: "fail", message: "Community not found" })
    return
  }

  if (
    community.leader.id !== foundUser.id &&
    community.deputyLeader.id !== foundUser.id
  ) {
    res.status(403).send({ result: "fail", message: "Permission denied" })
    return
  }
  const newRetreatAttendData = retreatAttendDatabase.create({
    user: {
      id: targetUserId,
    },
    postcardContent: content,
  })

  await retreatAttendDatabase.save(newRetreatAttendData)
  res.send({ result: "success" })
})

router.use("/sharing", sharingRouter)
router.use("/admin", adminRouter)

export default router

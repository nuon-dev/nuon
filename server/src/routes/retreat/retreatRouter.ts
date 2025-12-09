import express from "express"
import {
  chatLogDatabase,
  communityDatabase,
  inOutInfoDatabase,
  retreatAttendDatabase,
} from "../../model/dataSource"
import { getUserFromToken } from "../../util/util"
import adminRouter from "./adminRouter"
import sharingRouter from "./sharingRouter"
import { RetreatAttend } from "../../entity/retreat/retreatAttend"
import { HowToMove, InOutType } from "../../entity/types"

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

router.post("/edit-information", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const retreatAttend: RetreatAttend = req.body

  const foundRetreatAttend = await retreatAttendDatabase.findOne({
    where: {
      id: retreatAttend.id,
      user: {
        id: foundUser.id,
      },
    },
    relations: {
      inOutInfos: true,
    },
  })

  if (!foundRetreatAttend) {
    res.status(401).send({ result: "fail" })
    return
  }

  if (retreatAttend.id !== foundRetreatAttend.id) {
    res.status(401).send({ result: "fail" })
    return
  }

  await retreatAttendDatabase.save({
    id: retreatAttend.id,
    howToGo: retreatAttend.howToGo,
    howToBack: retreatAttend.howToBack,
    etc: retreatAttend.etc,
  })

  //카풀이 불가능한 선택하면 자동으로 생성된 이동 정보 제거
  if (
    retreatAttend.howToGo === HowToMove.together ||
    retreatAttend.howToGo === HowToMove.driveCarAlone
  ) {
    const autoCreatedInOutInfo = await inOutInfoDatabase.findOne({
      where: {
        retreatAttend: retreatAttend,
        autoCreated: true,
        inOutType: InOutType.IN,
      },
      relations: {
        userInTheCar: true,
      },
    })
    if (autoCreatedInOutInfo) {
      const deleteUserInTheCar = autoCreatedInOutInfo.userInTheCar.map(
        async (userInTheCar) => {
          userInTheCar.rideCarInfo = null
          await inOutInfoDatabase.save(userInTheCar)
        }
      )
      await Promise.all(deleteUserInTheCar)
      await inOutInfoDatabase.remove(autoCreatedInOutInfo)
    }
  } else {
    foundRetreatAttend.inOutInfos.forEach(async (inOutInfo) => {
      if (!inOutInfo.autoCreated) {
        return
      }
      if (inOutInfo.inOutType === InOutType.IN) {
        inOutInfo.howToMove = retreatAttend.howToGo
        await inOutInfoDatabase.save(inOutInfo)
      }
    })
  }

  if (
    retreatAttend.howToBack === HowToMove.together ||
    retreatAttend.howToBack === HowToMove.driveCarAlone
  ) {
    const autoCreatedInOutInfo = await inOutInfoDatabase.findOne({
      where: {
        retreatAttend: retreatAttend,
        autoCreated: true,
        inOutType: InOutType.OUT,
      },
      relations: {
        userInTheCar: true,
      },
    })
    if (autoCreatedInOutInfo) {
      const deleteUserInTheCar = autoCreatedInOutInfo.userInTheCar.map(
        async (userInTheCar) => {
          userInTheCar.rideCarInfo = null
          await inOutInfoDatabase.save(userInTheCar)
        }
      )
      await Promise.all(deleteUserInTheCar)
      await inOutInfoDatabase.remove(autoCreatedInOutInfo)
    }
  } else {
    foundRetreatAttend.inOutInfos.forEach(async (inOutInfo) => {
      if (!inOutInfo.autoCreated) {
        return
      }
      if (inOutInfo.inOutType === InOutType.OUT) {
        inOutInfo.howToMove = retreatAttend.howToBack
        await inOutInfoDatabase.save(inOutInfo)
      }
    })
  }

  res.send({ result: "success" })
})

router.post("/chat", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const { chat, type } = req.body

  const newChat = chatLogDatabase.create({
    user: foundUser,
    content: chat,
    type: type,
  })

  await chatLogDatabase.save(newChat)

  res.send({ result: "success" })
})

router.post("/complete", async (req, res) => {
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
    relations: {
      user: true,
    },
  })

  if (!foundRetreatAttend) {
    res.status(401).send({ result: "fail" })
    return
  }

  if (
    foundRetreatAttend.isCanceled === true &&
    !foundRetreatAttend.attendanceNumber
  ) {
    foundRetreatAttend.attendanceNumber = await retreatAttendDatabase.count({
      where: {
        isCanceled: false,
      },
    })
    foundRetreatAttend.attendanceNumber += 1
  }
  foundRetreatAttend.isCanceled = false

  await retreatAttendDatabase.save(foundRetreatAttend)

  res.send({ result: "success" })
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

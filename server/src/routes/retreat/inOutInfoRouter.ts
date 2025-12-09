import express from "express"
import {
  inOutInfoDatabase,
  retreatAttendDatabase,
} from "../../model/dataSource"
import { getUserFromToken } from "../../util/util"
import { InOutInfo } from "../../entity/retreat/inOutInfo"

const router = express.Router()

router.get("/", async (req, res) => {
  const foundUser = await getUserFromToken(req)

  if (!foundUser) {
    res.status(401).send({ result: "fail" })
    return
  }

  const inOutInfo = await inOutInfoDatabase.find({
    relations: {
      retreatAttend: {
        user: true,
      },
    },
    where: {
      retreatAttend: {
        user: {
          id: foundUser.id,
        },
      },
    },
  })

  res.send(
    inOutInfo.map((info) => {
      return {
        id: info.id,
        time: info.time,
        howToMove: info.howToMove,
        day: info.day,
        position: info.position,
        autoCreated: info.autoCreated,
        inOutType: info.inOutType,
      }
    })
  )
})

router.post("/edit-information", async (req, res) => {
  const foundUser = await getUserFromToken(req)
  const inOutInfo = req.body as InOutInfo

  const foundRetreatAttend = await retreatAttendDatabase.findOne({
    where: {
      user: {
        id: foundUser.id,
      },
    },
  })

  if (inOutInfo.id) {
    await inOutInfoDatabase.save(inOutInfo)
  } else {
    const createdInOuInfo = inOutInfoDatabase.create(inOutInfo)
    createdInOuInfo.retreatAttend = foundRetreatAttend
    await inOutInfoDatabase.save(createdInOuInfo)
  }
  res.send({ result: "success" })
})

router.post("/delete-attend-time", async (req, res) => {
  const inOutInfo = req.body as InOutInfo
  const foundUser = await getUserFromToken(req)

  const foundInoutInfo = await inOutInfoDatabase.findOne({
    where: {
      id: inOutInfo.id,
    },
    relations: {
      retreatAttend: {
        user: true,
      },
      userInTheCar: true,
    },
  })

  if (foundUser.id !== foundInoutInfo.retreatAttend.user.id) {
    res.status(401).send({ result: "fail" })
    return
  }

  const deleteUserInTheCar = foundInoutInfo.userInTheCar.map(
    async (userInTheCar) => {
      userInTheCar.rideCarInfo = null
      return await inOutInfoDatabase.save(userInTheCar)
    }
  )

  await Promise.all(deleteUserInTheCar)

  await inOutInfoDatabase.remove(inOutInfo)
  res.send({ result: "success" })
})

export default router

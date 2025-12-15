import express from "express"
import { PermissionType } from "../../../entity/types"
import { inOutInfoDatabase, userDatabase } from "../../../model/dataSource"
import { hasPermission } from "../../../util/util"
import { InOutInfo } from "../../../entity/retreat/inOutInfo"

const router = express.Router()

router.get("/get-car-info", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.carpooling))) {
    res.sendStatus(401)
    return
  }

  const infoList = await inOutInfoDatabase.find({
    select: {
      inOutType: true,
      id: true,
      time: true,
      howToMove: true,
      userInTheCar: true,
      day: true,
      position: true,
      retreatAttend: {
        id: true,
        memo: true,
        etc: true,
        user: {
          name: true,
          phone: true,
          yearOfBirth: true,
          gender: true,
        },
      },
    },
    relations: {
      retreatAttend: {
        user: true,
      },
      rideCarInfo: true,
      userInTheCar: {
        retreatAttend: {
          user: true,
        },
      },
    },
    where: {
      retreatAttend: {
        isCanceled: false,
      },
    },
  })
  res.send(infoList)
})

router.post("/set-car", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.carpooling))) {
    res.sendStatus(401)
    return
  }

  const data = req.body
  const inOutInfo = data.inOutInfo as InOutInfo

  if (inOutInfo.day === undefined || inOutInfo.day === null) {
    res.send({})
    return
  }

  await inOutInfoDatabase.save(inOutInfo)
  res.send({ result: "success" })
  return
})

export default router

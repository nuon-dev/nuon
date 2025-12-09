import express from "express"
import { hasPermission, hasPermissionFromReq } from "../../../util/util"
import { PermissionType } from "../../../entity/types"
import {
  inOutInfoDatabase,
  retreatAttendDatabase,
} from "../../../model/dataSource"
import { InOutInfo } from "../../../entity/retreat/inOutInfo"

const router = express.Router()

router.get("/get-user-data", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.editUserData))) {
    res.sendStatus(401)
    return
  }

  const { userId } = req.query
  const foundUser = await retreatAttendDatabase.findOne({
    where: {
      id: userId as string,
    },
    relations: {
      user: true,
      inOutInfos: true,
    },
  })

  if (!foundUser) {
    res.send({ result: "false" })
    return
  }

  res.send({
    result: "true",
    userData: foundUser,
  })
})

router.post("/edit-retreat-attend", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.editUserData))) {
    res.sendStatus(401)
    return
  }

  const retreatAttend = req.body
  const foundRetreatAttend = await retreatAttendDatabase.update(
    {
      id: retreatAttend.id,
    },
    {
      howToGo: retreatAttend.howToGo,
      howToBack: retreatAttend.howToBack,
      memo: retreatAttend.memo,
    }
  )

  if (!foundRetreatAttend) {
    res.send({ result: "false" })
    return
  }

  res.send({ result: "success" })
})

router.post("/edit-in-out-info", async (req, res) => {
  const hasPermission = await hasPermissionFromReq(
    req,
    PermissionType.editUserData
  )
  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const { inOutInfos, retreatAttendId } = req.body as {
    inOutInfos: InOutInfo[]
    retreatAttendId: number
  }
  const result = inOutInfos.map(async (inOutInfo) => {
    if (inOutInfo.id) {
      return await inOutInfoDatabase.update(
        {
          id: inOutInfo.id,
        },
        inOutInfo
      )
    } else {
      const createdInOutInfo = inOutInfoDatabase.create(inOutInfo)
      createdInOutInfo.retreatAttend = {
        id: retreatAttendId,
      } as any
      await inOutInfoDatabase.save(createdInOutInfo)
    }
  })
  try {
    await Promise.all(result)
  } catch (e) {
    res.send({ result: "fail" })
    return
  }

  res.send({ result: "success" })
})

router.post("/delete-user", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.deleteUser))) {
    res.sendStatus(401)
    return
  }

  const { userId } = req.body
  const foundRetreatAttend = await retreatAttendDatabase.findOne({
    where: {
      id: userId,
    },
  })

  if (!foundRetreatAttend) {
    res.send({ result: "false" })
    return
  }

  foundRetreatAttend.isCanceled = true
  await retreatAttendDatabase.save(foundRetreatAttend)
  res.send({ result: "success" })
})

router.post("/delete-in-out-info", async (req, res) => {
  const hasPermission = await hasPermissionFromReq(
    req,
    PermissionType.editUserData
  )
  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const inOutInfo = req.body as InOutInfo

  if (!inOutInfo.id) {
    res.send({ result: "fail" })
    return
  }

  const foundInoutInfo = await inOutInfoDatabase.findOne({
    where: {
      id: inOutInfo.id,
    },
    relations: {
      userInTheCar: true,
    },
  })

  if (!foundInoutInfo) {
    res.send({ result: "fail" })
    return
  }

  const updateUserInTheCar = foundInoutInfo.userInTheCar.map(
    async (userInTheCar) => {
      userInTheCar.rideCarInfo = null
      await inOutInfoDatabase.save(userInTheCar)
    }
  )

  await Promise.all(updateUserInTheCar)

  await inOutInfoDatabase.remove(inOutInfo)
  res.send({ result: "success" })
})

export default router

import express from "express"
import { PermissionType } from "../../../entity/types"
import {
  inOutInfoDatabase,
  retreatAttendDatabase,
  userDatabase,
} from "../../../model/dataSource"
import { hasPermission } from "../../../util/util"
import { IsNull, Not } from "typeorm"

const router = express.Router()

router.get("/get-room-assignment", async (req, res) => {
  const token = req.header("token")
  if (
    false === (await hasPermission(token, PermissionType.showRoomAssignment))
  ) {
    res.sendStatus(401)
    return
  }

  const userList = await retreatAttendDatabase.find({
    select: {
      id: true,
      etc: true,
      inOutInfos: true,
      roomNumber: true,
      user: {
        id: true,
        name: true,
        yearOfBirth: true,
        gender: true,
      },
    },
    relations: {
      user: true,
      inOutInfos: true,
    },
    where: {
      isCanceled: false,
    },
  })

  res.send(userList)
})

router.post("/get-user-info", async (req, res) => {
  const data = req.body
  const userId = data.userId

  const foundUser = await userDatabase.findOneBy({
    id: userId,
  })

  const attendInfo = await inOutInfoDatabase.find({
    where: {},
  })

  res.send({
    user: foundUser,
    attendInfo,
  })
  return
})

router.post("/set-room", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.roomManage))) {
    res.sendStatus(401)
    return
  }

  const data = req.body
  const selectedUser = data.selectedUser

  await retreatAttendDatabase.save(selectedUser)

  res.send({ result: "success" })
  return
})

export default router

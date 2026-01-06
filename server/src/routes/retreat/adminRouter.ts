import express from "express"
import { hasPermissionFromReq } from "../../util/util"
import {
  permissionDatabase,
  retreatAttendDatabase,
  userDatabase,
} from "../../model/dataSource"
import { PermissionType } from "../../entity/types"
import { Permission } from "../../entity/permission"

import RoomRouter from "./admin/room"
import GroupRouter from "./admin/retreatGroup"
import CarRouter from "./admin/car"
import DashBoard from "./admin/dashBoard"
import Deposit from "./admin/deposit"
import EditUserData from "./admin/edit-user-data"
import { Not } from "typeorm"

const router = express.Router()

router.get("/get-all-user-name", async (req, res) => {
  const hasPermission = await hasPermissionFromReq(req, PermissionType.userList)
  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const retreatAttendList = await retreatAttendDatabase.find({
    select: {
      user: {
        name: true,
        id: true,
        gender: true,
        yearOfBirth: true,
      },
    },
    where: {
      isCanceled: false,
      user: {
        name: Not(""),
      },
    },
    relations: {
      user: true,
    },
  })

  const userList = retreatAttendList.map((attend) => {
    return {
      id: attend.user.id,
      name: attend.user.name,
      gender: attend.user.gender,
      yearOfBirth: attend.user.yearOfBirth,
    }
  })
  res.send(userList)
})

router.post("/get-user-permission-info", async (req, res) => {
  const data = req.body
  const hasPermission = await hasPermissionFromReq(
    req,
    PermissionType.permissionManage
  )
  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const user = await userDatabase.findOne({
    where: {
      id: data.userId,
    },
    relations: {
      permissions: true,
    },
  })
  if (user) {
    res.send(user.permissions)
  } else {
    res.send([])
  }
})

router.get("/get-all-user", async (req, res) => {
  const hasPermission = await hasPermissionFromReq(req, PermissionType.userList)

  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const userList = await retreatAttendDatabase.find({
    select: {
      id: true,
      howToBack: true,
      howToGo: true,
      memo: true,
      etc: true,
      inOutInfos: true,
      isDeposited: true,
      createAt: true,
      attendanceNumber: true,
      isHalf: true,
      isWorker: true,
      user: {
        name: true,
        phone: true,
        yearOfBirth: true,
        gender: true,
      },
    },
    where: {
      isCanceled: false,
    },
    relations: {
      user: true,
    },
  })

  res.send(userList)
})

router.post("/set-user-permission", async (req, res) => {
  const data = req.body

  const hasPermission = await hasPermissionFromReq(
    req,
    PermissionType.permissionManage
  )
  if (!hasPermission) {
    res.sendStatus(401)
    return
  }

  const user = await userDatabase.findOne({
    where: {
      id: data.userId,
    },
    relations: {
      permissions: true,
    },
  })

  if (!user) {
    res.sendStatus(500)
    return
  }

  const targetPermission = user.permissions.find(
    (permission) => permission.permissionType === data.permissionType
  )
  if (targetPermission) {
    targetPermission.have = data.have
    await permissionDatabase.save(targetPermission)
  } else {
    const permission = new Permission()
    permission.have = data.have
    permission.permissionType = data.permissionType
    permission.user = user
    await permissionDatabase.save(permission)
  }
  res.send({ result: "success" })
})

router.use("/", RoomRouter)
router.use("/", GroupRouter)
router.use("/", CarRouter)
router.use("/", DashBoard)
router.use("/", Deposit)
router.use("/", EditUserData)

export default router

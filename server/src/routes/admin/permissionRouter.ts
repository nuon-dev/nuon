import express from "express"
import { permissionDatabase, userDatabase } from "../../model/dataSource"
import { PermissionType } from "../../entity/types"
import { hasPermissionFromReq } from "../../util/util"

const router = express.Router()

router.get("/get-all-user", async (req, res) => {
  const users = await userDatabase.find({
    relations: {
      permissions: true,
    },
  })

  res.send(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      yearOfBirth: user.yearOfBirth,
      permissions: user.permissions.map((permission) => ({
        id: permission.id,
        permissionType: permission.permissionType,
        have: permission.have,
      })),
    })),
  )
})

router.post("/set-user-permission", async (req, res) => {
  const { userId, permissionType } = req.body

  const user = await userDatabase.findOne({
    where: { id: userId },
    relations: { permissions: true },
  })

  if (!user) {
    res.status(404).send({ message: "User not found" })
    return
  }

  const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)

  if (!isAdmin) {
    res.status(403).send({ message: "Forbidden" })
    return
  }

  console.log("user is admin", isAdmin)

  const permission = user.permissions.find(
    (p) => p.permissionType === permissionType,
  )

  if (permission) {
    res.status(404).send({ message: "Permission already exists" })
    return
  }

  const createdPermission = permissionDatabase.create({
    user: user,
    permissionType: permissionType,
    have: true,
  })
  await permissionDatabase.save(createdPermission)

  res.send({ message: "Permission updated successfully" })
})

router.delete("/delete-user-permission", async (req, res) => {
  const { userId, permissionType } = req.body

  const user = await userDatabase.findOne({
    where: { id: userId },
    relations: { permissions: true },
  })

  if (!user) {
    res.status(404).send({ message: "User not found" })
    return
  }

  const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)

  if (!isAdmin) {
    res.status(403).send({ message: "Forbidden" })
    return
  }

  const permission = user.permissions.find(
    (p) => p.permissionType === permissionType,
  )

  if (!permission) {
    res.status(404).send({ message: "Permission not found" })
    return
  }

  await permissionDatabase.remove(permission)

  res.send({ message: "Permission deleted successfully" })
})

export default router

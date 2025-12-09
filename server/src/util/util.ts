import crypto from "crypto"
import dotenv from "dotenv"
import { PermissionType } from "../entity/types"
import { permissionDatabase, userDatabase } from "../model/dataSource"
import { User } from "../entity/user"
import express from "express"
import jwt from "jsonwebtoken"

const env = dotenv.config().parsed || {}

export const hashCode = function (content: string) {
  return crypto
    .createHash("sha512")
    .update(content + env.HASH_KEY)
    .digest("hex")
}

export async function hasPermission(
  token: string | undefined,
  permissionType: PermissionType
): Promise<boolean> {
  const foundUser = await userDatabase.findOne({
    where: {
      token,
    },
    relations: {
      permissions: true,
    },
  })

  if (!token) {
    return false
  }

  if (!foundUser) {
    return false
  }

  if (foundUser.isSuperUser) {
    return true
  }

  const userListPermission = foundUser.permissions.find(
    (permission) => permission.permissionType === permissionType
  )

  if (userListPermission && userListPermission.have) {
    return true
  }

  return false
}

export async function deleteUser(user: User) {
  const permissionDelete = user.permissions.map(async (permission) => {
    return await permissionDatabase.delete(permission)
  })
  await Promise.all(permissionDelete)

  await userDatabase.delete({ id: user.id })
}

export async function getUserFromToken(req: express.Request) {
  const token = req.header("token")
  if (!token) {
    return null
  }
  const { id } = jwt.verify(token, env.JWT_SECRET)

  return await userDatabase.findOne({
    relations: {
      community: true,
    },
    where: {
      id: id,
    },
  })
}

export async function hasPermissionFromReq(
  req: express.Request,
  permissionType: PermissionType
) {
  const token = req.header("token")
  return await hasPermission(token, permissionType)
}

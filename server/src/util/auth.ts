import jwt from "jsonwebtoken"
import { User } from "../entity/user"
import { REFRESH_TOKEN_EXPIRE_DAYS } from "../model/user"

export function generateRefreshToken(user: User) {
  const payload = {
    id: user.id,
    createdAt: new Date().getTime(),
  }
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
  })
}

export function generateAccessToken(user: User) {
  let role = getRole(user)

  const payload = {
    id: user.id,
    name: user.name,
    yearOfBirth: user.yearOfBirth,
    community: {
      id: user.community?.id,
      name: user.community?.name,
    },
    role: role,
  }
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  })
}

function getRole(user: User): "member" | "leader" | "admin" {
  if (user.isSuperUser) {
    return "admin"
  }
  if (!user.community) {
    return "member"
  }

  if (!user.community.leader && !user.community.deputyLeader) {
    return "member"
  }

  if (
    user.community.leader.id === user.id ||
    user.community.deputyLeader.id === user.id
  ) {
    return "leader"
  }
  return "member"
}

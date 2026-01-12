import jwt from "jsonwebtoken"
import { User } from "../entity/user"
import { REFRESH_TOKEN_EXPIRE_DAYS } from "../model/user"
import { Community } from "../entity/community"
import { communityDatabase } from "../model/dataSource"

export interface Role {
  Admin: boolean
  Leader: boolean
  VillageLeader: boolean
}

export interface jwtPayload {
  id: string
  name: string
  yearOfBirth: number
  community: Community
  role: Role
  iat: number
  exp: number
}

export function generateRefreshToken(user: User) {
  const payload = {
    id: user.id,
    createdAt: new Date().getTime(),
  }
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
  })
}

export async function generateAccessToken(user: User) {
  let role = await getRole(user)

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

async function getRole(user: User): Promise<Role> {
  let isLeader = false
  if (user.community) {
    if (user.community.leader && user.community.leader.id === user.id) {
      isLeader = true
    } else if (
      user.community.deputyLeader &&
      user.community.deputyLeader.id === user.id
    ) {
      isLeader = true
    }
  }

  let villageLeader = false
  const myCommunity = await communityDatabase.findOne({
    where: { id: user.community?.id },
    relations: {
      children: true,
    },
  })
  if (myCommunity.children.length > 0) {
    villageLeader = true
  }

  return {
    Admin: user.isSuperUser,
    Leader: isLeader,
    VillageLeader: villageLeader,
  }
}

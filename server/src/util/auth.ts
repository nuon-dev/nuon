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

export async function getKakaoTokenFromAuthCode(code: string): Promise<string> {
  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY || "",
      redirect_uri: `${getServerUrl()}/common/login`,
      code: code,
    }),
  })

  const tokenData = (await response.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
    refresh_token_expires_in: number
    scope: string
  }
  return tokenData.access_token
}

export async function getKakaoIdFromAccessToken(
  accessToken: string,
): Promise<string> {
  const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const userData = (await userResponse.json()) as { id: string }
  return userData.id
}

//Todo: cors에 있는 것도 그렇고, 어떻게 관리 해야 하나?
const target = process.env.NEXT_PUBLIC_API_TARGET
function getServerUrl() {
  switch (target) {
    case "prod":
      return `https://nuon.iubns.net`
    case "dev":
      return `https://nuon-dev.iubns.net`
    case "local":
    default:
      return `http://localhost:8080`
  }
}

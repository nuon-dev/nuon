import jwt from "jsonwebtoken"
import { User } from "../entity/user"
import { REFRESH_TOKEN_EXPIRE_DAYS } from "../model/user"
import {
  communityDatabase,
  newcomerManagerDatabase,
  permissionDatabase,
} from "../model/dataSource"
import { Role } from "./type"
import { PermissionType } from "../entity/types"
import userModel from "../model/user"

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
  if (myCommunity && myCommunity.children.length > 0) {
    villageLeader = true
  }

  const newcomerManager = await newcomerManagerDatabase.findOne({
    where: { user: { id: user.id } },
  })

  const isAdmin = await permissionDatabase.findOne({
    where: {
      user: {
        id: user.id,
      },
      permissionType: PermissionType.admin,
    },
    relations: {
      user: true,
    },
  })

  return {
    Admin: isAdmin ? true : false,
    Leader: isLeader,
    VillageLeader: villageLeader,
    NewcomerManager: newcomerManager ? true : false,
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

export async function getJumoaTokenFromAuthCode(code: string) {
  const prefix = process.env.NEXT_PUBLIC_API_TARGET === "prod" ? "PROD" : "DEV"
  const tokenUrl = process.env[`${prefix}_JUMOA_SERVER_URL`] + "/oauth2/token"
  const clientId = process.env[`${prefix}_JUMOA_CLIENT_ID`]
  const clientSecret = process.env[`${prefix}_JUMOA_CLIENT_SECRET`]
  const redirectUri = process.env[`${prefix}_JUMOA_REDIRECT_URI`]

  if (!tokenUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error("주모아 OAuth 환경변수가 설정되지 않았습니다.")
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    console.error(
      `주모아 OAuth 토큰 요청 실패: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
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

const twentyOneDays = 1000 * 60 * 60 * 24 * 21
export async function sendLoginDataToClient(res: any, user: User) {
  const newUserToken = await userModel.loginFromUser(user)
  res
    .header("Access-Control-Allow-Credentials", "true")
    .cookie("refreshToken", newUserToken.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: twentyOneDays,
      expires: new Date(Date.now() + twentyOneDays),
    })
    .send({ result: "success", accessToken: newUserToken.accessToken })
}

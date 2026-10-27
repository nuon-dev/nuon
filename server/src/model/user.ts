import { User } from "../entity/user"
import { generateAccessToken, generateRefreshToken } from "../util/auth"
import { userDatabase } from "./dataSource"

export const REFRESH_TOKEN_EXPIRE_DAYS = 21

async function loginFromUser(user: User): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const newRefreshToken = generateRefreshToken(user)
  user.token = newRefreshToken
  const expireDay = new Date()
  expireDay.setDate(expireDay.getDate() + REFRESH_TOKEN_EXPIRE_DAYS)
  user.expire = expireDay
  await userDatabase.save(user)

  const newAccessToken = await generateAccessToken(user)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

async function getUSerFromKakaoId(kakaoId: string): Promise<User | null> {
  const foundUser = await userDatabase.findOne({
    where: {
      kakaoId: kakaoId,
    },
    relations: {
      community: {
        leader: true,
        deputyLeader: true,
      },
    },
  })
  return foundUser || null
}

async function registerNewUser(
  kakaoId: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const now = new Date()
  const createUser = new User()
  createUser.kakaoId = kakaoId
  createUser.createAt = new Date()
  createUser.gender = ""
  const newRefreshToken = generateRefreshToken(createUser)
  createUser.token = newRefreshToken
  createUser.expire = new Date(
    now.setDate(now.getDate() + REFRESH_TOKEN_EXPIRE_DAYS),
  )
  await userDatabase.save(createUser)
  const newAccessToken = await generateAccessToken(createUser)
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

async function updateUserData(user: User): Promise<void> {
  await userDatabase.save(user)
}

async function getUserFromRefreshToken(
  refreshToken: string,
): Promise<User | null> {
  const foundUser = await userDatabase.findOne({
    where: {
      token: refreshToken,
    },
    relations: {
      community: {
        leader: true,
        deputyLeader: true,
      },
    },
  })
  return foundUser || null
}

interface JumoaData {
  id: number
  email: string
  name: string
  mobile: string
  role: "pending" | "super" | "minister" | "leader" | "member"
  linkedProviders: string[]
}

async function getJumoaDataFromJumoaToken(
  jumoaToken: string,
): Promise<JumoaData | null> {
  const jumoaApiUrl = process.env.DEV_JUMOA_SERVER_URL
  try {
    const response = await fetch(`${jumoaApiUrl}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jumoaToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Jumoa data")
    }

    const jumoaData = await response.json()
    return jumoaData
  } catch (error) {
    console.error("Error fetching Jumoa data:", error)
    return null
  }
}

export default {
  loginFromUser,
  registerNewUser,
  updateUserData,
  getUSerFromKakaoId,
  getJumoaDataFromJumoaToken,
  getUserFromRefreshToken,
}

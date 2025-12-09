import { User } from "../entity/user"
import { generateAccessToken, generateRefreshToken } from "../util/auth"
import { userDatabase } from "./dataSource"

export const REFRESH_TOKEN_EXPIRE_DAYS = 21

async function loginFromKakaoId(kakaoId: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const foundUser = await userDatabase.findOneBy({
    kakaoId: kakaoId,
  })
  if (!foundUser) {
    return null
  }

  const newRefreshToken = generateRefreshToken(foundUser)
  foundUser.token = newRefreshToken
  const expireDay = new Date()
  expireDay.setDate(expireDay.getDate() + REFRESH_TOKEN_EXPIRE_DAYS)
  foundUser.expire = expireDay
  await userDatabase.save(foundUser)

  const newAccessToken = generateAccessToken(foundUser)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

async function registerNewUser(
  kakaoId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const now = new Date()
  const createUser = new User()
  createUser.kakaoId = kakaoId
  createUser.createAt = new Date()
  createUser.gender = ""
  const newRefreshToken = generateRefreshToken(createUser)
  createUser.token = newRefreshToken
  createUser.expire = new Date(
    now.setDate(now.getDate() + REFRESH_TOKEN_EXPIRE_DAYS)
  )
  await userDatabase.save(createUser)
  const newAccessToken = generateAccessToken(createUser)
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

async function updateUserData(user: User): Promise<void> {
  await userDatabase.save(user)
}

async function createNewAccessToken(currentToken: string): Promise<{
  success: boolean
  accessToken?: string
  refreshToken?: string
}> {
  const foundUser = await userDatabase.findOne({
    where: { token: currentToken },
    relations: {
      community: true,
    },
  })
  if (!foundUser) {
    return {
      success: false,
    }
  }

  const newRefreshToken = generateRefreshToken(foundUser)
  foundUser.token = newRefreshToken
  const expireDay = new Date()
  expireDay.setDate(expireDay.getDate() + 21)
  foundUser.expire = expireDay
  await userDatabase.save(foundUser)

  const newAccessToken = generateAccessToken(foundUser)

  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

export default {
  loginFromKakaoId,
  registerNewUser,
  updateUserData,
  createNewAccessToken,
}

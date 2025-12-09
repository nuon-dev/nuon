import { User } from "../entity/user"
import { hashCode } from "../util"
import { userDatabase } from "./dataSource"

async function loginFromKakaoId(kakaoId: string): Promise<string> {
  const foundUser = await userDatabase.findOneBy({
    kakaoId: kakaoId,
  })
  if (!foundUser) {
    return null
  }

  foundUser.token = hashCode(foundUser.kakaoId + new Date().getTime())
  const expireDay = new Date()
  expireDay.setDate(expireDay.getDate() + 21)
  foundUser.expire = expireDay
  await userDatabase.save(foundUser)
  return foundUser.token
}

async function registerNewUser(kakaoId: string): Promise<string> {
  const now = new Date()
  const createUser = new User()
  createUser.kakaoId = kakaoId
  createUser.createAt = new Date()
  createUser.gender = ""
  createUser.token = hashCode(kakaoId + now.getTime().toString())
  createUser.expire = new Date(now.setDate(now.getDate() + 7))
  await userDatabase.save(createUser)
  return createUser.token
}

async function updateUserData(user: User): Promise<void> {
  await userDatabase.save(user)
}

export default { loginFromKakaoId, registerNewUser, updateUserData }

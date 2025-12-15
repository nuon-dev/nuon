"use client"

import { jwtDecode } from "jwt-decode"
import useKakaoHook from "@/hooks/useKakao"
import { get, post } from "@/config/api"
import { atom, useAtom } from "jotai"
import { EditContent } from "./useBotChatLogic"
import { User } from "@server/entity/user"
import dayjs from "dayjs"
import { Community } from "@server/entity/community"

export const UserInformationAtom = atom<User | undefined>(undefined)

export default function useUserData() {
  const { getKakaoToken } = useKakaoHook()
  const [userInformation, setUserInformation] = useAtom(UserInformationAtom)

  async function getUserDataFromToken(): Promise<User | undefined> {
    const token = localStorage.getItem("token")
    if (!token) {
      return undefined
    }
    const userData = jwtDecode(token)
    if (dayjs(userData.exp)) {
      //Todo: refresh token logic
      return undefined
    }
    const myInfo = await get("/soon/my-info")
    return myInfo
  }

  async function getUserDataFromKakaoLogin(): Promise<User | undefined> {
    try {
      var kakaoToken = await getKakaoToken()
      const { accessToken, result } = await post("/auth/receipt-record", {
        kakaoId: kakaoToken,
      })
      localStorage.setItem("token", accessToken)

      const userData = jwtDecode<User>(accessToken)
      console.log(accessToken, userData)
      if (result === "success") {
        setUserInformation(userData)
        return userData
      }
    } catch {
      return undefined
    }
    return undefined
  }

  type UserKey = keyof User

  function editUserInformation(key: UserKey, value: User[UserKey]) {
    if (!userInformation) {
      return
    }
    setUserInformation({
      ...userInformation,
      [key]: value,
    })
  }

  async function saveUserInformation() {
    await post("/auth/edit-my-information", userInformation)
  }

  function checkMissedUserInformation() {
    if (!userInformation) {
      return EditContent.none
    }
    if (!userInformation.name) {
      return EditContent.name
    } else if (!userInformation.yearOfBirth) {
      return EditContent.yearOfBirth
    } else if (!userInformation.phone) {
      return EditContent.phone
    } else if (!userInformation.gender) {
      return EditContent.gender
    } else if (!userInformation.community) {
      return EditContent.darak
    }
    return EditContent.none
  }

  return {
    getUserDataFromToken,
    getUserDataFromKakaoLogin,
    editUserInformation,
    saveUserInformation,
    checkMissedUserInformation,
  }
}

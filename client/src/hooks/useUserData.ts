"use client"

import { jwtDecode } from "jwt-decode"
import useKakaoHook from "./useKakao"
import axios from "@/config/axios"
import { atom, useAtom } from "jotai"
import dayjs from "dayjs"
import { Community } from "@server/entity/community"
import { jwtPayload } from "./useAuth"

export const JwtInformationAtom = atom<jwtPayload | undefined>(undefined)

/**
 * @deprecated use useAuth instead
 */
export default function useUserData() {
  const { getKakaoToken } = useKakaoHook()
  const [JwtInformation, setJwtInformation] = useAtom(JwtInformationAtom)

  async function getUserDataFromToken(): Promise<jwtPayload | undefined> {
    if (JwtInformation && JwtInformation.exp > dayjs().unix()) {
      return JwtInformation
    }
    const token = localStorage.getItem("token")
    if (!token) {
      return undefined
    }
    const jwtPayload = jwtDecode<jwtPayload>(token)
    if (dayjs(jwtPayload.exp).isBefore(dayjs())) {
      //Todo: refresh token logic
      return undefined
    }
    setJwtInformation(jwtPayload)
    return jwtPayload
  }

  async function getUserDataFromKakaoLogin(): Promise<jwtPayload | undefined> {
    try {
      var kakaoToken = await getKakaoToken()
      const { data, status } = await axios.post("/auth/login", {
        kakaoId: kakaoToken,
      })
      if (status !== 200) {
        return undefined
      }
      const { accessToken, result } = data
      localStorage.setItem("token", accessToken)

      const userData = jwtDecode<jwtPayload>(accessToken)
      if (result === "success") {
        setJwtInformation(userData)
        return userData
      }
    } catch {
      return undefined
    }
    return undefined
  }

  return {
    getUserDataFromToken,
    getUserDataFromKakaoLogin,
  }
}

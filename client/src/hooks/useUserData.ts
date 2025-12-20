"use client"

import { jwtDecode } from "jwt-decode"
import { atom, useAtom } from "jotai"
import dayjs from "dayjs"
import { jwtPayload } from "./useAuth"

export const JwtInformationAtom = atom<jwtPayload | undefined>(undefined)

/**
 * @deprecated use useAuth instead
 */
export default function useUserData() {
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

  return {
    getUserDataFromToken,
  }
}

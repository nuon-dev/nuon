"use client"

import { jwtDecode } from "jwt-decode"
import { useEffect } from "react"
import { atom, useAtom, useAtomValue } from "jotai"
import dayjs from "dayjs"
import useKakaoHook from "@/hooks/useKakao"
import axios from "@/config/axios"
import { Community } from "@server/entity/community"
import { useRouter } from "next/navigation"

export const JwtInformationAtom = atom<jwtPayload | null>(null)

//Todo: 서버와 통합할 수 있는 방법 찾아보기, 지금은 jwt type error로 인해 분리
export interface jwtPayload {
  id: string
  name: string
  yearOfBirth: number
  community: Community
  role: "admin" | "leader" | "user"
  iat: number
  exp: number
}
const isLoginAtom = atom((get) => !!get(JwtInformationAtom))

export default function useAuth() {
  const isLogin = useAtomValue(isLoginAtom)
  const [authUserData, setAuthUserData] = useAtom(JwtInformationAtom)
  const { getKakaoToken } = useKakaoHook()
  const { push } = useRouter()

  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  async function loadFromLocalStorage() {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }
    const userData = jwtDecode<jwtPayload>(token)
    const expiration = dayjs.unix(userData.exp)
    if (dayjs().isAfter(expiration)) {
      const userData = await getNewAccessToken()
      return setAuthUserData(userData)
    }
    setAuthUserData(userData)
  }

  async function getNewAccessToken(): Promise<jwtPayload | null> {
    const { data } = await axios.post("/auth/refresh-token", {})
    const { result, accessToken } = data
    if (result === "success") {
      const userData = jwtDecode<jwtPayload>(accessToken)
      localStorage.setItem("token", accessToken)
      return userData
    }
    return null
  }

  async function login() {
    const kakaoId = await getKakaoToken()
    const { data, status } = await axios.post("/auth/login", {
      kakaoId: kakaoId,
    })
    const { result, accessToken } = data
    if (status !== 200 || result !== "success") {
      return
    }
    localStorage.setItem("token", accessToken)
    const userData = jwtDecode<jwtPayload>(accessToken)
    setAuthUserData(userData)
  }

  function ifNotLoggedGoToLogin(returnUrl?: string) {
    if (!isLogin) {
      let loginUrl = `/common/login`
      if (returnUrl) {
        loginUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`
      }
      push(loginUrl)
    }
  }

  return {
    authUserData,
    isLogin,
    login,
    ifNotLoggedGoToLogin,
  }
}

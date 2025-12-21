"use client"

import { jwtDecode } from "jwt-decode"
import { useEffect } from "react"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import dayjs from "dayjs"
import useKakaoHook from "@/hooks/useKakao"
import axios from "@/config/axios"
import { Community } from "@server/entity/community"
import { useRouter } from "next/navigation"
import { NotificationMessage } from "@/state/notification"

export const JwtInformationAtom = atom<jwtPayload | null | undefined>(null)

export interface Role {
  Admin: boolean
  Leader: boolean
}

//Todo: 서버와 통합할 수 있는 방법 찾아보기, 지금은 jwt type error로 인해 분리
export interface jwtPayload {
  id: string
  name: string
  yearOfBirth: number
  community: Community
  role: Role
  iat: number
  exp: number
}
const isLoginAtom = atom((get) => get(JwtInformationAtom) != null)

export default function useAuth() {
  const { push } = useRouter()
  const { getKakaoToken } = useKakaoHook()
  const isLogin = useAtomValue(isLoginAtom)
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const [authUserData, setAuthUserData] = useAtom(JwtInformationAtom)

  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  async function loadFromLocalStorage() {
    const token = localStorage.getItem("token")
    if (!token) {
      setAuthUserData(null)
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
      return false
    }
    localStorage.setItem("token", accessToken)
    const userData = jwtDecode<jwtPayload>(accessToken)
    setAuthUserData(userData)
    return userData
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

  function isLeaderIfNotExit(redirectUrl: string) {
    ifNotLoggedGoToLogin(redirectUrl)

    if (!authUserData) {
      return false
    }

    if (authUserData.role.Leader === false) {
      push("/")
      setNotificationMessage("순장 권한이 없습니다.")
      return false
    }
    return true
  }

  function isAdminIfNotExit(redirectUrl: string) {
    ifNotLoggedGoToLogin(redirectUrl)

    if (!authUserData) {
      return false
    }

    if (authUserData.role.Admin === false) {
      push("/")
      setNotificationMessage("관리자 권한이 없습니다.")
      return false
    }
    return true
  }

  return {
    authUserData,
    isLogin,
    login,
    ifNotLoggedGoToLogin,
    isLeaderIfNotExit,
    isAdminIfNotExit,
  }
}

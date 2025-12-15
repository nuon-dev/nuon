"use client"

import { jwtDecode } from "jwt-decode"
import { useEffect } from "react"
import { atom, useAtom, useAtomValue } from "jotai"
import dayjs from "dayjs"
import useKakaoHook from "@/hooks/useKakao"
import axios from "@/config/axios"

interface AuthUserData {
  id: string
  name: string
  yearOfBirth: number
  community: {
    id: string
    name: string
  } | null
  role: "member" | "leader" | "admin"
  exp: number
  iap: number
}

const userAuthAtom = atom<AuthUserData | null>(null)
const isLoginAtom = atom((get) => !!get(userAuthAtom))

export default function useAuth() {
  const isLogin = useAtomValue(isLoginAtom)
  const [authUserData, setAuthUserData] = useAtom(userAuthAtom)

  const { getKakaoToken } = useKakaoHook()

  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  async function loadFromLocalStorage() {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }
    const userData = jwtDecode<AuthUserData>(token)
    const expiration = dayjs.unix(userData.exp)
    if (dayjs().isAfter(expiration)) {
      const userData = await getNewAccessToken()
      return setAuthUserData(userData)
    }
    setAuthUserData(userData)
  }

  async function getNewAccessToken(): Promise<AuthUserData | null> {
    const { data } = await axios.post("/auth/refresh-token", {})
    const { result, accessToken } = data
    if (result === "success") {
      const userData = jwtDecode<AuthUserData>(accessToken)
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
    const userData = jwtDecode<AuthUserData>(accessToken)
    setAuthUserData(userData)
  }

  return {
    authUserData,
    isLogin,
    login,
  }
}

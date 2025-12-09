"use client"

import { jwtDecode } from "jwt-decode"
import { useEffect } from "react"
import { atom, useAtom } from "jotai"
import dayjs from "dayjs"
import { post } from "@/config/api"

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

export default function useAuth() {
  const [authUserData, setAuthUserData] = useAtom(userAuthAtom)

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
    const { result, accessToken } = await post("/auth/refresh-token", {})
    if (result === "success") {
      const userData = jwtDecode<AuthUserData>(accessToken)
      localStorage.setItem("token", accessToken)
      return userData
    }
    return null
  }

  return {
    authUserData,
  }
}

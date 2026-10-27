"use client"

import { jwtDecode } from "jwt-decode"
import { useEffect } from "react"
import { atom, useAtom, useAtomValue } from "jotai"
import dayjs from "dayjs"
import { Role } from "@server/util/type"
import axios from "@/config/axios"
import { Community } from "@server/entity/community"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import useKakaoHook from "./useKakao"

export const JwtInformationAtom = atom<jwtPayload | null | undefined>(null)

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
const kakaoTokenAtom = atom<string | null>(null)

export default function useAuth() {
  const { push } = useRouter()
  const isLogin = useAtomValue(isLoginAtom)
  const { error } = useNotification()
  const [authUserData, setAuthUserData] = useAtom(JwtInformationAtom)
  const [kakaoToken, setKakaoToken] = useAtom(kakaoTokenAtom)

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

  async function getKakaoTokenFromAuthCode(code: string) {
    const { data } = await axios.post("/auth/get-kakao-token", {
      code: code,
    })
    setKakaoToken(data.kakaoToken)
    return data.kakaoToken
  }

  const { executeKakaoLogin } = useKakaoHook()
  async function getJumoaTokenFromAuthCode(code: string) {
    if (!code) {
      throw new Error("주모아 인증 코드가 없습니다.")
    }

    try {
      const { data, status } = await axios.post("/auth/login-from-jumoa-code", {
        code,
      })

      if (status === 200) {
        const { accessToken } = data
        localStorage.setItem("token", accessToken)
        const userData = jwtDecode<jwtPayload>(accessToken)
        setAuthUserData(userData)
        return userData
      }
      return data.jumoaToken
    } catch (error: any) {
      console.error("Error getting Jumoa token:", error)
      if (error.status === 404) {
        const { accessToken, refreshToken } = error.response.data
        localStorage.setItem("jumoaToken", accessToken)
        alert(
          "주모아 계정이 등록되지 않았습니다. 카카오 로그인으로 연동을 시도합니다.",
        )
        await executeKakaoLogin()
      }
      throw new Error(
        error.response?.data?.message ||
          "주모아 로그인 처리 중 오류가 발생했습니다.",
      )
    }
  }

  async function bindjJumoaWithKakao(kakaoToken: string): Promise<jwtPayload> {
    if (!kakaoToken) {
      throw new Error("카카오 토큰이 없습니다.")
    }

    const jumoaToken = localStorage.getItem("jumoaToken")
    if (!jumoaToken) {
      alert("주모아 토큰이 없습니다.")
    }
    const { data } = await axios.post(
      "/auth/bind-jumoa-with-kakao",
      {
        kakaoToken: kakaoToken,
        jumoaToken: jumoaToken,
      },
      {
        withCredentials: true,
      },
    )
    const { accessToken } = data
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
      error("순장 권한이 없습니다.")
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
      error("관리자 권한이 없습니다.")
      return false
    }
    return true
  }

  function logout() {
    localStorage.removeItem("token")
    setAuthUserData(null)
    push("/common/login")
  }

  function requestJumoaLogin(returnUrl?: string) {
    const jumoaClientId = process.env.NEXT_PUBLIC_DEV_JUMOA_CLIENT_ID
    const jumoaRedirectUri = process.env.NEXT_PUBLIC_DEV_JUMOA_REDIRECT_URI
    const jumoaServerUrl = process.env.NEXT_PUBLIC_DEV_JUMOA_SERVER_URL

    let jumoaLoginUrl = `${jumoaServerUrl}/oauth2/authorize?response_type=code&client_id=${jumoaClientId}&redirect_uri=${
      jumoaRedirectUri
    }`

    if (returnUrl) {
      jumoaLoginUrl += `&state=${encodeURIComponent(returnUrl)}`
    }

    globalThis.location.href = jumoaLoginUrl
  }

  return {
    authUserData,
    isLogin,
    bindjJumoaWithKakao,
    ifNotLoggedGoToLogin,
    isLeaderIfNotExit,
    isAdminIfNotExit,
    logout,
    kakaoToken,
    getKakaoTokenFromAuthCode,
    getJumoaTokenFromAuthCode,
    requestJumoaLogin,
  }
}

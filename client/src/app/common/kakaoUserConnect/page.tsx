"use client"

import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import useKakaoHook from "@/hooks/useKakao"
import { Button, Stack } from "@mui/material"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

export default function KakaoLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KakaoLogin />
    </Suspense>
  )
}

function KakaoLogin() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const { executeKakaoLogin } = useKakaoHook()
  const { kakaoToken } = useAuth()

  useEffect(() => {
    checkValidAccess()
  }, [])

  useEffect(() => {
    registerKakaoLogin(kakaoToken!)
  }, [kakaoToken])

  async function registerKakaoLogin(token: string) {
    try {
      const {
        data: { message, error },
      } = await axios.post("/soon/register-kakao-login", {
        userId,
        kakaoToken: token,
      })
      alert(message || error)
      if (message) {
        window.close()
      }
    } catch (error: any) {
      if (error.response) {
        alert(
          error.response.data.error ||
            "등록에 실패했습니다. 관리자에게 문의 해주세요.",
        )
      }
    }
  }

  async function requestKakaoLogin() {
    try {
      await executeKakaoLogin("/common/kakao-user-connect")
    } catch (error: any) {
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  async function checkValidAccess() {
    try {
      const {
        data: { message, error },
      } = await axios.get(`/soon/isValid-kakao-login-register?userId=${userId}`)
      if (error) {
        alert(error)
        return false
      }
    } catch (error: any) {
      alert("만료 되었거나 잘못된 접근입니다.")
      return false
    }
    return true
  }

  if (!userId) {
    return <Stack>잘못된 접근입니다.</Stack>
  }

  return (
    <Stack
      gap="12px"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Button variant="outlined" onClick={requestKakaoLogin}>
        카카오 로그인
      </Button>
    </Stack>
  )
}

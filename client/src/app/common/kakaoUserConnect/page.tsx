"use client"

import { post, get } from "@/config/api"
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

  useEffect(() => {
    checkValidAccess()
  }, [])

  const { getKakaoToken } = useKakaoHook()

  async function requestKakaoLogin() {
    const token = await getKakaoToken()
    if (!token) {
      alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.")
      return
    }

    const { message, error } = await post("/soon/register-kakao-login", {
      userId,
      kakaoId: token,
    })
    alert(message || error)
    if (message) {
      window.close()
    }
  }

  async function checkValidAccess() {
    try {
      const { message, error } = await get(
        `/soon/isValid-kakao-login-register?userId=${userId}`
      )
      if (error) {
        alert(error)
        return false
      }
    } catch (error) {
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

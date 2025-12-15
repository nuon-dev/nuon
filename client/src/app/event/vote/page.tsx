"use client"

import useAuth from "@/hooks/useAuth"
import useUserData from "@/hooks/useUserData"
import useKakaoHook from "@/kakao"
import { Button, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VotePage() {
  const { isLogin } = useAuth()
  const { push } = useRouter()
  const [] = useState()

  useEffect(() => {
    checkLogin()
  }, [isLogin])

  async function checkLogin() {
    if(!isLogin) {
      push("/common/login", {
        query: { returnUrl: "/event/vote" },
      })
    }
  }

  function handelVote() {}

  if (!isLogin) {
    return (
      <Stack
        minHeight="100vh"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        카카오 로그인이 필요합니다.
        <Button variant="outlined" onClick={checkLogin}>
          로그인 하러가기
        </Button>
      </Stack>
    )
  }

  return (
    <Stack>
      <Button variant="outlined" onClick={checkLogin}>
        로그인 하러가기
      </Button>
    </Stack>
  )
}

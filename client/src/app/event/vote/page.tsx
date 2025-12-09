"use client"

import useUserData from "@/hooks/useUserData"
import useKakaoHook from "@/kakao"
import { Button, Stack } from "@mui/material"
import { useEffect, useState } from "react"

export default function VotePage() {
  const { getKakaoToken } = useKakaoHook()
  const { getUserDataFromKakaoLogin } = useUserData()
  const [isLogin, setIsLogin] = useState<boolean>(false)
  const [] = useState()

  useEffect(() => {
    checkLogin()
  }, [])

  async function checkLogin() {
    const user = await getUserDataFromKakaoLogin()
    console.log(user)
    if (user) {
      setIsLogin(true)
    }
  }

  async function login() {
    await getKakaoToken()
    const user = await getUserDataFromKakaoLogin()
    console.log(user)
    if (user) {
      setIsLogin(true)
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
        <Button variant="outlined" onClick={login}>
          로그인 하러가기
        </Button>
      </Stack>
    )
  }

  return <Stack></Stack>
}

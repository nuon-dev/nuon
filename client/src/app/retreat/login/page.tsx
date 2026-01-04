"use client"

import { Stack } from "@mui/material"
import RetreatButton from "../components/Button"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function RetreatLogin() {
  const { login, kakaoToken } = useAuth()
  const { push } = useRouter()

  async function handleKakaoLogin() {
    try {
      alert("접수 오픈 예정입니다!")
      return
      await login()
      push("/retreat")
    } catch {
      push("/retreat?newUser=true")
    }
  }
  return (
    <Stack
      bgcolor="#2F3237"
      width="100vw"
      justifyContent="center"
      minHeight="100vh"
      alignItems="center"
    >
      <img src="/retreat/login/top_bg.png" alt="top background" width="70%" />
      <Stack width="50%">
        <RetreatButton label="카카오로 로그인" onClick={handleKakaoLogin} />
      </Stack>
      <Stack mt="12%" alignItems="center">
        <img
          src="/retreat/login/bottom_bg.png"
          alt="bottom background"
          width="50%"
        />
      </Stack>
    </Stack>
  )
}

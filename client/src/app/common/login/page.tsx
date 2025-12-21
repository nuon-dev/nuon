"use client"

import { Suspense } from "react"
import { useEffect } from "react"
import { useSetAtom } from "jotai"
import useAuth from "@/hooks/useAuth"
import { Button, Stack } from "@mui/material"
import { NotificationMessage } from "@/state/notification"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  )
}

function Login() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const { isLogin, login } = useAuth()
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl") || "/"
    if (isLogin) {
      push(returnUrl)
    }
  }, [isLogin])

  async function handleLogin() {
    const user = await login()
    if (!user) {
      setNotificationMessage("로그인에 실패했습니다. 다시 시도해주세요.")
      return
    }
  }
  return (
    <Stack>
      <Stack
        gap="12px"
        sx={{
          width: "100%",
          height: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack>새벽이슬</Stack>
        <Button variant="outlined" onClick={handleLogin}>
          카카오로 로그인
        </Button>
      </Stack>
    </Stack>
  )
}

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
    try {
      await login()
    } catch (error) {
      console.error(error)
      setNotificationMessage("등록되지 않은 사용자 입니다.")
    }
  }

  return (
    <Stack>
      <Stack
        gap="20px"
        sx={{
          width: "100%",
          height: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" mb={2}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#222",
              letterSpacing: -1,
            }}
          >
            수원 제일 교회 청년부
          </span>
          <span
            style={{
              fontSize: 22,
              color: "#555",
              marginTop: 8,
              fontWeight: 500,
              letterSpacing: -0.5,
            }}
          >
            새벽이슬
          </span>
        </Stack>
        <Button
          variant="contained"
          onClick={handleLogin}
          sx={{
            background: "#fee500",
            color: "#3c1e1e",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "10px 32px",
            "&:hover": { background: "#ffe066" },
          }}
        >
          카카오로 로그인
        </Button>
      </Stack>
    </Stack>
  )
}

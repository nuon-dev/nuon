"use client"

import { Button, Stack } from "@mui/material"
import Header from "@/app/leader/components/Header"
import useUserData from "@/hooks/useUserData"
import { useRouter } from "next/navigation"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"

export default function Login() {
  const { push } = useRouter()
  const { getUserDataFromKakaoLogin } = useUserData()
  const setNotificationMessage = useSetAtom(NotificationMessage)

  async function handleLogin() {
    const user = await getUserDataFromKakaoLogin()
    if (!user) {
      setNotificationMessage("로그인에 실패했습니다. 다시 시도해주세요.")
      return
    }
    push("/")
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

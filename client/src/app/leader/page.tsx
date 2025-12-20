"use client"

import useAuth from "@/hooks/useAuth"
import { NotificationMessage } from "@/state/notification"
import { Stack } from "@mui/material"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LeaderPage() {
  const { push } = useRouter()
  const { isLogin, authUserData } = useAuth()
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    isLeaderIfNotExit()
  }, [])

  function isLeaderIfNotExit() {
    if (!isLogin) {
      push(`/common/login?returnUrl=/leader`)
      return
    }
    if (!authUserData) {
      return
    }
    if (authUserData.role.Leader === false) {
      push("/")
      setNotificationMessage("리더 권한이 없습니다.")
      return
    }
    return true
  }

  return <Stack p="12px">나중에 일정이나 공지 있음 좋을 듯?</Stack>
}

"use client"

import useAuth from "@/hooks/useAuth"
import { NotificationMessage } from "@/state/notification"
import { Stack } from "@mui/material"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LeaderPage() {
  const { push } = useRouter()
  const { isLeaderIfNotExit, authUserData } = useAuth()

  useEffect(() => {
    isLeaderIfNotExit("/leader")
  }, [])

  return <Stack p="12px">나중에 일정이나 공지 있음 좋을 듯?</Stack>
}

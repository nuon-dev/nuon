"use client"

import useAuth from "@/hooks/useAuth"
import { Stack } from "@mui/material"
import { useEffect } from "react"

export default function LeaderPage() {
  const { isLeaderIfNotExit, authUserData } = useAuth()

  useEffect(() => {
    isLeaderIfNotExit("/leader")
  }, [])

  return <Stack p="12px">나중에 일정이나 공지 추가 예정</Stack>
}

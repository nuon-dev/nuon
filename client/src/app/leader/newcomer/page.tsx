"use client"

import useAuth from "@/hooks/useAuth"
import { Stack, Typography } from "@mui/material"
import { useEffect } from "react"
import Link from "next/link"

export default function NewcomerPage() {
  const { isLeaderIfNotExit } = useAuth()

  useEffect(() => {
    isLeaderIfNotExit("/leader/newcomer")
  }, [])

  return (
    <Stack p="12px" spacing={2}>
      <Typography variant="h5" fontWeight="bold">
        새신자 관리
      </Typography>
      <Stack spacing={1}>
        <Link href="/leader/newcomer/management">새신자 등록/조회</Link>
        <Link href="/leader/newcomer/education">교육 현황</Link>
      </Stack>
    </Stack>
  )
}

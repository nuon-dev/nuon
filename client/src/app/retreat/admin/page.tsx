"use client"

import jwt from "jwt-decode"
import useKakaoHook from "@/hooks/useKakao"
import { post } from "@/config/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button, Stack } from "@mui/material"
import Header from "@/components/retreat/admin/Header"
import useAuth from "@/hooks/useAuth"

//아이콘 주소 https://www.flaticon.com/kr/
export default function Admin() {
  const router = useRouter()
  const { ifNotLoggedGoToLogin } = useAuth()

  useEffect(() => {
    ifNotLoggedGoToLogin("/retreat/admin")
  }, [])

  return (
    <Stack>
      <Header />
    </Stack>
  )
}

"use client"

import { Stack } from "@mui/material"
import Header from "@/components/Header/index"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/useAuth"
import Link from "@/app/link/page"

export default function Index() {
  const { isLogin } = useAuth()
  const { push } = useRouter()

  useEffect(() => {
    checkLogin()
  }, [])

  async function checkLogin() {
    if (!isLogin) {
      push("/common/login")
    }
  }

  return (
    <Stack sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Link />
    </Stack>
  )
}

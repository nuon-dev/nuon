"use client"

import { Stack } from "@mui/material"
import Header from "@/components/Header/index"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/useAuth"

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
    <Stack>
      <Header />
    </Stack>
  )
}

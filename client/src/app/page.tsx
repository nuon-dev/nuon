"use client"

import { Stack } from "@mui/material"
import Header from "@/components/Header/index"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/useAuth"
import Link from "@/app/link/page"
import { AxiosError } from "axios"

export default function Index() {
  const { isLogin } = useAuth()
  const { push } = useRouter()

  useEffect(() => {
    checkLogin()
    isApp()
  }, [])

  async function checkLogin() {
    if (!isLogin) {
      push("/common/login")
    }
  }

  function isApp() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).ReactNativeWebView) {
        push("/temp-app")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            platform: "web",
          }),
        )
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      alert(`Error: ${axiosError.message}`)
    }
  }

  return (
    <Stack sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Link />
    </Stack>
  )
}

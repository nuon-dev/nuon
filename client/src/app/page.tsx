"use client"

import { Stack } from "@mui/material"
import Header from "@/components/Header/index"
import useUserData from "@/hooks/useUserData"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Index() {
  const { getUserDataFromToken } = useUserData()
  const { push } = useRouter()

  useEffect(() => {
    checkLogin()
  }, [])

  async function checkLogin() {
    const user = await getUserDataFromToken()
    if (!user) {
      push("/common/login")
    }
  }
  return (
    <Stack>
      <Header />
    </Stack>
  )
}

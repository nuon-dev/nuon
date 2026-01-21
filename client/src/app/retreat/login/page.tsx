"use client"

import { Stack } from "@mui/material"
import RetreatButton from "../components/Button"
import { useRouter } from "next/navigation"
import usePageColor from "@/hooks/usePageColor"
import useBodyOverflowHidden from "@/hooks/useBodyOverflowHidden"
import useKakaoHook from "@/hooks/useKakao"

export default function RetreatLogin() {
  useBodyOverflowHidden()
  usePageColor("#2F3237")
  const { executeKakaoLogin } = useKakaoHook()
  const { push } = useRouter()

  async function handleKakaoLogin() {
    try {
      await executeKakaoLogin("/retreat")
    } catch {
      push("/retreat?newUser=true")
    }
  }
  return (
    <Stack
      width="100vw"
      minHeight="100vh"
      bgcolor="#2F3237"
      fontFamily="NEXON_Warhaven_OTF"
      overflow="hidden"
    >
      <Stack
        width="100vw"
        justifyContent="center"
        minHeight="100dvh"
        alignItems="center"
      >
        <img src="/retreat/login/top_bg.png" alt="top background" width="70%" />
        <Stack width="50%" mt="5vh">
          <RetreatButton label="카카오로 로그인" onClick={handleKakaoLogin} />
        </Stack>
        <Stack mt="12%" alignItems="center">
          <img
            src="/retreat/login/bottom_bg.png"
            alt="bottom background"
            width="50%"
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

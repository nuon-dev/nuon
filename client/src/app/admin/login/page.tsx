"use client"

import { Button } from "@mui/material"
import { useRouter } from "next/navigation"
import useKakaoHook from "@/hooks/useKakao"
import { post } from "@/config/api"

export default function AdminLoginPage() {
  const kakao = useKakaoHook()
  const router = useRouter()

  async function kakaoLogin() {
    const kakaoToken = await kakao.getKakaoToken()
    const { accessToken } = await post("/auth/login", {
      kakaoId: kakaoToken,
    })
    localStorage.setItem("token", accessToken)
    router.push("/admin")
  }

  return (
    <Button
      style={{
        marginTop: "40px",
        backgroundColor: "#FEE500",
        color: "#191919",
        height: "60px",
        width: "240px",
        borderRadius: "12px",
        fontSize: "24px",
        fontWeight: "bold",
      }}
      onClick={kakaoLogin}
    >
      카카오 로그인
    </Button>
  )
}

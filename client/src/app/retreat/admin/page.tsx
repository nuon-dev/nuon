"use client"

import jwt from "jwt-decode"
import useKakaoHook from "@/hooks/useKakao"
import { post } from "@/config/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button, Stack } from "@mui/material"
import Header from "@/components/retreat/admin/Header"

//아이콘 주소 https://www.flaticon.com/kr/
export default function Admin() {
  const router = useRouter()
  const kakao = useKakaoHook()

  const [isLogin, setIsLogin] = useState(false)

  const goToPage = (path: string) => {
    router.push(`/retreat/admin${path}`)
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const userData = jwt.jwtDecode(token)
    console.log(userData)
    post("/auth/check-token", {
      token,
    }).then((response) => {
      if (response.result === "true") {
        setIsLogin(true)
      }
    })
  }, [])

  async function kakaoLogin() {
    const kakaoToken = await kakao.getKakaoToken()
    const { token } = await post("/auth/receipt-record", {
      kakaoId: kakaoToken,
    })
    localStorage.setItem("token", token)
    setIsLogin(true)
  }

  const loginForm = () => {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        padding="6px"
        margin="20px"
      >
        준비팀 화면
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
      </Stack>
    )
  }

  return (
    <Stack>
      <Header />
      {!isLogin && loginForm()}
    </Stack>
  )
}

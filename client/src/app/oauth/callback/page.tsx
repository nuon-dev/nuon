"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useAuth from "@/hooks/useAuth"

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackMessage message="로그인 처리 중입니다." />}>
      <Callback />
    </Suspense>
  )
}

function CallbackMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

function Callback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getJumoaTokenFromAuthCode } = useAuth()
  const [message, setMessage] = useState("로그인 처리 중입니다.")
  const hasStarted = useRef(false)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  useEffect(() => {
    if (hasStarted.current) {
      return
    }

    if (!code) {
      setMessage("로그인 코드가 없습니다.")
      return
    }

    hasStarted.current = true
    getJumoaTokenFromAuthCode(code)
      .then(() => router.replace(state || "/"))
      .catch((error) =>
        setMessage(error.message || "로그인 처리 중 오류가 발생했습니다."),
      )
  }, [code, getJumoaTokenFromAuthCode, router, state])

  return <CallbackMessage message={message} />
}

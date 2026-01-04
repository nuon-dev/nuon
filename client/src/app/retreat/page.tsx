"use client"

import useAuth from "@/hooks/useAuth"
import { Stack } from "@mui/material"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import FirstStep from "./steps/first"
import SecondStep from "./steps/second"
import ThirdStep from "./steps/third"
import useRetreat from "./hooks/useRetreat"
import FourthStep from "./steps/fourth"
import FifthStep from "./steps/fifthStep"

export default function RetreatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RetreatContent />
    </Suspense>
  )
}

function RetreatContent() {
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get("newUser")
  const { isLogin } = useAuth()
  const { push } = useRouter()

  const { step, setStep } = useRetreat()

  useEffect(() => {
    if (isNewUser === "true") {
      setStep(1)
    }
  }, [isNewUser])

  useEffect(() => {
    if (!isLogin && isNewUser !== "true") {
      push("/retreat/login")
    }
  }, [isLogin])

  var topImageUrl = ""
  if (step === 1) {
    topImageUrl = "/retreat/main/first_top.png"
  } else if (step === 2) {
    topImageUrl = "/retreat/main/second_top.png"
  } else if (step === 3) {
    topImageUrl = "/retreat/main/third_top.png"
  } else if (step === 4) {
    topImageUrl = "/retreat/main/fourth_top.png"
  } else if (step === 5) {
    topImageUrl = "/retreat/main/fifth_top.png"
  }

  return (
    <Stack
      width="100vw"
      height="100vh"
      alignItems="center"
      bgcolor="#2F3237"
      justifyContent="center"
    >
      <Stack height="100%" alignItems="center" justifyContent="center" pt="20%">
        <img src={topImageUrl} alt={`step ${step} top`} width="60%" />
        <Stack height="100%">
          {step === 1 && <FirstStep />}
          {step === 2 && <SecondStep />}
          {step === 3 && <ThirdStep />}
          {step === 4 && <FourthStep />}
          {step === 5 && <FifthStep />}
        </Stack>
      </Stack>
      <Stack height="20%" alignItems="center" justifyContent="center">
        <img src="/retreat/main/bottom.png" alt="first top" width="80px" />
      </Stack>
    </Stack>
  )
}

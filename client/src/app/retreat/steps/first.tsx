"use client"

import { Box, Stack } from "@mui/material"
import useRetreat from "../hooks/useRetreat"
import RetreatButton from "../components/Button"
import { useState } from "react"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function FirstStep() {
  const [name, setName] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [phone, setPhone] = useState("010  -           -           ")

  const { kakaoToken } = useAuth()
  const { setStep, updateNuon, getMyInfo } = useRetreat()
  const { push } = useRouter()

  async function handleNextStep(gender: "man" | "woman") {
    if (!kakaoToken) {
      alert("로그인이 필요합니다.")
      push("/retreat/login")
      return
    }
    if (name.trim() === "" || birthYear.trim() === "" || phone.trim() === "") {
      alert("모든 정보를 입력해주세요.")
      return
    }
    try {
      await updateNuon({
        kakaoId: kakaoToken,
        name,
        yearOfBirth: parseInt(birthYear),
        phone: phone.replaceAll("-", ""),
        gender: gender,
      })
    } catch (e) {
      alert(
        "정보 등록에 실패했습니다. 새로고침후 다시 시도해주세요." + e.toString()
      )
      return
    }
    setStep(2)
  }

  function onClickPhone() {
    if (phone === "010  -           -           ") {
      setPhone("010-")
    }
  }

  return (
    <Stack alignItems="center" height="100%" gap="24px">
      <Stack color="white" textAlign="center" my="10%">
        <Box fontSize="14px" color="#999">
          등록된 정보가 없어 입력이 필요합니다.
        </Box>
        <Box fontSize="24px">아래 정보를 입력해주세요.</Box>
      </Stack>
      <Stack
        width="80%"
        height="40px"
        alignContent="center"
        justifyContent="center"
      >
        <RetreatButton
          label="이름:"
          labelPosition="flex-start"
          onClick={() => {}}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            position: "absolute",
            width: "60%",
            height: "40px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "16px",
            paddingLeft: "80px",
          }}
        />
      </Stack>
      <Stack
        width="80%"
        height="40px"
        alignContent="center"
        justifyContent="center"
      >
        <RetreatButton
          label="년생"
          labelPosition="flex-end"
          onClick={() => {}}
        />
        <input
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          style={{
            position: "absolute",
            width: "100px",
            height: "40px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "16px",
            paddingLeft: "40%",
          }}
        />
      </Stack>
      <Stack
        width="80%"
        height="40px"
        alignContent="center"
        justifyContent="center"
      >
        <RetreatButton label={""} onClick={onClickPhone} />
        <input
          type="text"
          value={phone}
          onClick={onClickPhone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={17}
          style={{
            textAlign: "center",
            position: "absolute",
            width: "60%",
            height: "40px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "16px",
            paddingLeft: "20px",
          }}
        />
      </Stack>
      <Stack width="80%" flexDirection="row" height="40px" gap="20px">
        <RetreatButton label="남" onClick={() => handleNextStep("man")} />
        <RetreatButton label="여" onClick={() => handleNextStep("woman")} />
      </Stack>
    </Stack>
  )
}

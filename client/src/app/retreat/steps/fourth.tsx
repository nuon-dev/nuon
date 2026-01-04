"use client"

import { Stack, Box } from "@mui/material"
import useRetreat from "../hooks/useRetreat"
import useAuth from "@/hooks/useAuth"
import RetreatButton from "../components/Button"
import { useEffect, useState } from "react"
import { User } from "@server/entity/user"

export default function FourthStep() {
  const [myInfo, setMyInfo] = useState<User | null>(null)
  const { fetchRetreatAttend, getMyInfo, isWorker, isHalf } = useRetreat()

  useEffect(() => {
    getMyInfo().then((data) => {
      setMyInfo(data)
    })
  }, [])

  function getGenderString() {
    const gender = myInfo?.gender
    if (!gender) return ""
    if (gender === "man") {
      return "남자"
    } else {
      return "여자"
    }
  }

  return (
    <Stack justifyContent="center" alignItems="center" px="10%">
      <Stack color="white" textAlign="center" my="30px">
        <Box fontSize="14px" color="#999">
          입력새주신 내용을 토대로 정리했습니다.
        </Box>
        <Box fontSize="24px">
          아래 내용이 맞는지
          <br />
          다시 한 번 확인해 주세요.
        </Box>
      </Stack>
      <Stack
        gap="3vh"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Stack direction="row" height="40px" gap="24px">
          <RetreatButton label={myInfo?.name || ""} onClick={() => {}} />
          <RetreatButton
            label={myInfo?.yearOfBirth + "년생"}
            onClick={() => {}}
          />
        </Stack>
        <Stack direction="row" height="40px" gap="24px">
          <Stack flex={2}>
            <RetreatButton label={myInfo?.phone || ""} onClick={() => {}} />
          </Stack>
          <Stack flex={1}>
            <RetreatButton label={getGenderString()} onClick={() => {}} />
          </Stack>
        </Stack>
        <Stack direction="row" height="40px" gap="24px">
          <Stack flex={2}>
            <RetreatButton
              label={isHalf ? "토요일 저녁집회 이전" : "토요일 저녁집회 이후"}
              onClick={() => {}}
            />
          </Stack>
          <Stack flex={1}>
            <RetreatButton
              label={isWorker ? "직장인" : "학생"}
              onClick={() => {}}
            />
          </Stack>
        </Stack>
        <Box height="1px" bgcolor="#888" width="100%" />
        <Stack
          gap="12px"
          width="60%"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <RetreatButton label={"확인 했어요"} onClick={() => {}} />
          <RetreatButton label={"수정할게요"} onClick={() => {}} />
        </Stack>
      </Stack>
    </Stack>
  )
}

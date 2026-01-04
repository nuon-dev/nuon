"use client"

import { Box, Stack } from "@mui/material"
import RetreatButton from "../components/Button"
import useRetreat from "../hooks/useRetreat"

export default function SecondStep() {
  const { setStep, setIsHalf } = useRetreat()

  async function handleNextStep(isHalf: boolean) {
    setStep(3)
    setIsHalf(isHalf)
  }
  return (
    <Stack alignItems="center" height="100%">
      <Stack color="white" textAlign="center" my="10%">
        <Box fontSize="14px" color="#999">
          (1/30 ~ 2/01)
        </Box>
        <Box fontSize="24px">
          2026 겨울 수련회
          <br />
          참석일자를 선택해주세요.
        </Box>
      </Stack>
      <Stack width="60%" gap="24px">
        <RetreatButton
          label="(토) 집회 이전"
          onClick={() => {
            handleNextStep(false)
          }}
        />
        <RetreatButton
          label="(토) 집회 이후"
          onClick={() => {
            handleNextStep(true)
          }}
        />
      </Stack>
    </Stack>
  )
}

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
    <Stack>
      <Stack color="white" textAlign="center" my="40px">
        <Box fontSize="14px" color="#999">
          (1/30 ~ 2/01)
        </Box>
        <Box fontSize="24px">
          2026 겨울 수련회
          <br />
          참석일자를 선택해주세요.
        </Box>
      </Stack>
      <Stack>
        <RetreatButton
          label="토요일 저녁집회 이전"
          onClick={() => {
            handleNextStep(false)
          }}
        />
      </Stack>
      <Stack mt="20px">
        <RetreatButton
          label="토요일 저녁집회 이후"
          onClick={() => {
            handleNextStep(true)
          }}
        />
      </Stack>
    </Stack>
  )
}

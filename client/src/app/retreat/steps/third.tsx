"use client"

import { Stack, Box } from "@mui/material"
import RetreatButton from "../components/Button"
import useRetreat from "../hooks/useRetreat"

export default function ThirdStep() {
  const { setIsWorker, setStep } = useRetreat()

  function handleNextStep(isWorker: boolean) {
    setIsWorker(isWorker)
    setStep(4)
  }

  return (
    <Stack alignItems="center" height="100%">
      <Stack color="white" textAlign="center" my="10%">
        <Box fontSize="14px" color="#999">
          수련회비를 위한 항목 입니다.
        </Box>
        <Box fontSize="24px">
          아래 2개의 항목 중<br />
          해당하는 항목을 선택 해 주세요.
        </Box>
      </Stack>
      <Stack width="60%" gap="24px">
        <RetreatButton
          label="직장인"
          onClick={() => {
            handleNextStep(true)
          }}
        />
        <RetreatButton
          label="학생"
          onClick={() => {
            handleNextStep(false)
          }}
        />
      </Stack>
    </Stack>
  )
}

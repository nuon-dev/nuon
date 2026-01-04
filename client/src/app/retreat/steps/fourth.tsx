"use client"

import { Stack, Box } from "@mui/material"

export default function FourthStep() {
  return (
    <Stack>
      <Stack color="white" textAlign="center" my="40px">
        <Box fontSize="14px" color="#999">
          입력새주신 내용을 토대로 정리했습니다.
        </Box>
        <Box fontSize="24px">
          아래 내용이 맞는지
          <br />
          다시 한 번 확인해 주세요.
        </Box>
      </Stack>
      <Stack></Stack>
    </Stack>
  )
}

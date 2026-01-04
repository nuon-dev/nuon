"use client"

import { Stack, Box } from "@mui/material"
import RetreatButton from "../components/Button"

export default function ThirdStep() {
  return (
    <Stack>
      <Stack color="white" textAlign="center" my="40px">
        <Box fontSize="14px" color="#999">
          수련회비를 위한 항목 입니다.
        </Box>
        <Box fontSize="24px">
          아래 2개의 항목중 <br />
          해당하는 항목을 선택해 주세요.
        </Box>
      </Stack>
      <Stack>
        <RetreatButton label="토요일 저녁집회 이후" onClick={() => {}} />
      </Stack>
      <Stack mt="20px">
        <RetreatButton label="토요일 오후 이후" onClick={() => {}} />
      </Stack>
    </Stack>
  )
}

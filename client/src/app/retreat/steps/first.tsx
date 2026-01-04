"use client"

import { Box, Stack } from "@mui/material"

export default function FirstStep() {
  return (
    <Stack>
      <Stack color="white" textAlign="center" my="40px">
        <Box fontSize="14px" color="#999">
          등록된 정보가 없어 입력이 필요합니다.
        </Box>
        <Box fontSize="24px">아래 정보를 입력해주세요.</Box>
      </Stack>
      <img src="/retreat/main/first_menu.png" alt="first menu" width="70%" />
    </Stack>
  )
}

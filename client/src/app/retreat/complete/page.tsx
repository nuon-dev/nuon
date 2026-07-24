"use client"

import { Box, Button, IconButton, Stack } from "@mui/material"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useNotification } from "@/hooks/useNotification"

export default function RetreatRegister() {
  const { push } = useRouter()

  function handleGoToBack() {
    push("/retreat")
  }

  return (
    <Stack paddingX="20px" gap="30px">
      <Stack direction="row" alignItems="center">
        <IconButton
          onClick={handleGoToBack}
          aria-label="뒤로가기"
          sx={{
            zIndex: 1,
            color: "#363232",
          }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <Box>수련회 신청</Box>
      </Stack>
      <Stack marginLeft="6px" gap="10px">
        <Box fontWeight="bold" fontSize="20px">
          수련회 신청이 완료되었습니다!
        </Box>
      </Stack>
      <Suspense fallback={<Box>Loading...</Box>}>
        <Content />
      </Suspense>
    </Stack>
  )
}

function Content() {
  const { success } = useNotification()
  const searchParams = useSearchParams()
  const isWorker = searchParams.get("isWorker") === "true"

  function copyToClipboard() {
    const accountInfo = `3333342703455 카카오뱅크\n
     ${isWorker ? "150,000원" : "120,000원"}`
    navigator.clipboard.writeText(accountInfo)
    success("계좌 정보가 복사되었습니다.")
  }

  return (
    <Stack fontSize="15px" width="100%" gap="12px" justifyContent="center">
      <Stack
        onClick={copyToClipboard}
        onTouchStart={copyToClipboard}
        gap="4px"
        padding="24px"
        bgcolor="#FFBFBF"
        borderRadius="8px"
      >
        <Stack>입금 계좌</Stack>
        <Box color="#E87C7C">3333342703455 카카오뱅크 (성은비)</Box>
        <Stack mt="24px">수련회비</Stack>
        <Stack>
          <Box color="#E87C7C">
            {isWorker ? "직장인" : "학생"}:{" "}
            {isWorker ? "150,000원" : "120,000원"}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

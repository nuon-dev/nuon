"use client"

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { Box, Button, IconButton, Stack } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import usePageColor from "@/hooks/usePageColor"
import { useNotification } from "@/hooks/useNotification"
import useRetreat from "../hooks/useRetreat"

const revealPage = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export default function RetreatRegister() {
  const { push } = useRouter()

  usePageColor("#FFFFFF")

  function handleGoToBack() {
    push("/retreat")
  }

  return (
    <Stack
      component="main"
      width="100%"
      minHeight="100dvh"
      display="flex"
      flexDirection="column"
      bgcolor="white"
      color="#171717"
      fontFamily="Pretendard"
      px="24px"
      pt="calc(18px + env(safe-area-inset-top))"
      pb="calc(32px + env(safe-area-inset-bottom))"
      boxSizing="border-box"
    >
      <Stack direction="row" alignItems="center" ml="-10px">
        <IconButton
          onClick={handleGoToBack}
          aria-label="뒤로가기"
          sx={{ color: "#171717" }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <Box component="h1" m={0} fontSize="24px" fontWeight={700}>
          수련회 신청
        </Box>
      </Stack>

      <Stack
        mt="48px"
        flex={1}
        sx={{
          animation: `${revealPage} 480ms cubic-bezier(0.22, 1, 0.36, 1)`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        <Box component="h2" m={0} fontSize="26px" fontWeight={700}>
          수련회 신청이 완료되었습니다!
        </Box>

        <Suspense fallback={<Box>Loading...</Box>}>
          <Content />
        </Suspense>
      </Stack>
    </Stack>
  )
}

function Content() {
  const { success } = useNotification()
  const searchParams = useSearchParams()
  const isWorker = searchParams.get("isWorker") === "true"
  const { isHalf } = useRetreat()

  function copyToClipboard() {
    const accountInfo = `3333342703455 카카오뱅크\n
     ${getPrice()}`
    navigator.clipboard.writeText(accountInfo)
    success("계좌 정보가 복사되었습니다.")
  }

  function getText() {
    if (isHalf) {
      return "부분 참여"
    }
    if (!isWorker) {
      return "학생"
    }
    return "직장인 "
  }

  function getPrice() {
    if (isHalf) {
      return "100,000원"
    }
    if (!isWorker) {
      return "120,000원"
    }
    return "150,000원"
  }

  return (
    <Stack
      fontSize="15px"
      width="100%"
      gap="12px"
      justifyContent="center"
      mt="28px"
    >
      <Stack
        onClick={copyToClipboard}
        onTouchStart={copyToClipboard}
        gap="4px"
        padding="24px"
        bgcolor="#FFF1F1"
        borderRadius="11px"
        border="1px solid #F0E4E4"
      >
        <Stack fontSize="13px" color="#E98585">
          입금 계좌
        </Stack>
        <Box color="#C87575" fontWeight={600}>
          3333342703455 카카오뱅크 (성은비)
        </Box>
        <Stack mt="24px" fontSize="13px" color="#E98585">
          수련회비
        </Stack>
        <Stack>
          <Box color="#C87575" fontWeight={600}>
            {getText()}: {getPrice()}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

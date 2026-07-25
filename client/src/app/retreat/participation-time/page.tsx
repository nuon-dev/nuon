"use client"

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, Button, IconButton, Stack } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import usePageColor from "@/hooks/usePageColor"
import axios from "@/config/axios"
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

export default function RetreatParticipationTime() {
  const { push } = useRouter()
  const { warning, success } = useNotification()
  const { isHalf, isWorker, setIsHalf } = useRetreat()

  usePageColor("#FFFFFF")

  function handleGoToBack() {
    push("/retreat")
  }

  async function handleApply() {
    if (!isHalf && isHalf !== false) {
      warning("참여 일정을 선택해주세요.")
      return
    }
    try {
      const { data } = await axios.post("/retreat/attend", {
        isHalf: isHalf,
        isWorker: isWorker,
      })
      success(data.result)
      push(`/retreat/complete?isWorker=${isWorker}`)
    } catch (error: any) {
      warning(
        error.response?.data?.result ||
          "신청 중 오류가 발생했습니다.\n뒤로가기 후 다시 시도해주세요.",
      )
      return
    }
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
          언제 참여하시나요?
        </Box>

        <Box mt="20px" color="#E98585" fontSize="13px">
          참여 가능한 일정을 선택해주세요.
        </Box>

        <Stack direction="row" gap="12px" mt="48px">
          <Button
            type="button"
            variant="outlined"
            onClick={() => setIsHalf(false)}
            startIcon={isHalf === false ? <CheckRoundedIcon /> : undefined}
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor: isHalf === false ? "#EAAFAF" : "#F0E4E4",
              bgcolor: isHalf === false ? "#FFF1F1" : "#FCFAFA",
              color: "#171717",
              fontFamily: "Pretendard",
              fontSize: "16px",
              textTransform: "none",
              "& .MuiButton-startIcon": {
                color: "#C87575",
              },
              "&:hover": {
                borderColor: "#EAAFAF",
                bgcolor: "#FFF6F6",
              },
            }}
          >
            주일 예배 이전
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={() => setIsHalf(true)}
            startIcon={isHalf === true ? <CheckRoundedIcon /> : undefined}
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor: isHalf === true ? "#EAAFAF" : "#F0E4E4",
              bgcolor: isHalf === true ? "#FFF1F1" : "#FCFAFA",
              color: "#171717",
              fontFamily: "Pretendard",
              fontSize: "16px",
              textTransform: "none",
              "& .MuiButton-startIcon": {
                color: "#C87575",
              },
              "&:hover": {
                borderColor: "#EAAFAF",
                bgcolor: "#FFF6F6",
              },
            }}
          >
            주일 예배 이후
          </Button>
        </Stack>
      </Stack>

      <Button
        type="button"
        variant="contained"
        disableElevation
        onClick={handleApply}
        sx={{
          mt: "auto",
          height: "50px",
          borderRadius: "12px",
          bgcolor: "#EAAFAF",
          color: "white",
          fontFamily: "Pretendard",
          fontSize: "16px",
          fontWeight: 700,
          textTransform: "none",
          "&:hover": {
            bgcolor: "#DF9F9F",
          },
        }}
      >
        신청하기
      </Button>
    </Stack>
  )
}

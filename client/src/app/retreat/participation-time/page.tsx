"use client"

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, Button, IconButton, Stack } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import usePageColor from "@/hooks/usePageColor"

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

type AttendanceSchedule = "beforeSundayWorship" | "afterSundayWorship" | ""

export default function RetreatParticipationTime() {
  const { push } = useRouter()
  const { warning } = useNotification()
  const [attendanceSchedule, setAttendanceSchedule] =
    useState<AttendanceSchedule>("")

  usePageColor("#FFFFFF")

  function handleGoToBack() {
    push("/retreat/search")
  }

  function handleApply() {
    if (!attendanceSchedule) {
      warning("참여 일정을 선택해주세요.")
      return
    }

    // TODO: 신청하기 API를 연결해주세요.
  }

  return (
    <Stack
      component="main"
      width="100%"
      minHeight="100dvh"
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
            onClick={() => setAttendanceSchedule("beforeSundayWorship")}
            startIcon={
              attendanceSchedule === "beforeSundayWorship" ? (
                <CheckRoundedIcon />
              ) : undefined
            }
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor:
                attendanceSchedule === "beforeSundayWorship"
                  ? "#EAAFAF"
                  : "#F0E4E4",
              bgcolor:
                attendanceSchedule === "beforeSundayWorship"
                  ? "#FFF1F1"
                  : "#FCFAFA",
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
            onClick={() => setAttendanceSchedule("afterSundayWorship")}
            startIcon={
              attendanceSchedule === "afterSundayWorship" ? (
                <CheckRoundedIcon />
              ) : undefined
            }
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor:
                attendanceSchedule === "afterSundayWorship"
                  ? "#EAAFAF"
                  : "#F0E4E4",
              bgcolor:
                attendanceSchedule === "afterSundayWorship"
                  ? "#FFF1F1"
                  : "#FCFAFA",
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
          mt: "35px",
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

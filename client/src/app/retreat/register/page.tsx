"use client"

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, Button, IconButton, Stack } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { useRouter } from "next/navigation"
import usePageColor from "@/hooks/usePageColor"
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
  const { isWorker, setIsWorker } = useRetreat()

  usePageColor("#FFFFFF")

  function handleGoToBack() {
    push("/retreat")
  }

  function handleSubmit() {
    push(`/retreat/participation-time`)
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
          직장인이신가요?
        </Box>

        <Box mt="20px" color="#E98585" fontSize="13px">
          해당되는 항목을 선택해주세요.
        </Box>

        <Stack direction="row" gap="12px" mt="48px">
          <Button
            type="button"
            variant="outlined"
            onClick={() => setIsWorker(true)}
            startIcon={isWorker ? <CheckRoundedIcon /> : undefined}
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor: isWorker ? "#EAAFAF" : "#F0E4E4",
              bgcolor: isWorker ? "#FFF1F1" : "#FCFAFA",
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
            직장인이에요!
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={() => setIsWorker(false)}
            startIcon={isWorker === false ? <CheckRoundedIcon /> : undefined}
            sx={{
              flex: 1,
              height: "72px",
              borderRadius: "11px",
              borderColor: isWorker === false ? "#EAAFAF" : "#F0E4E4",
              bgcolor: isWorker === false ? "#FFF1F1" : "#FCFAFA",
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
            직장인이 아니에요!
          </Button>
        </Stack>
      </Stack>

      <Button
        type="button"
        variant="contained"
        disableElevation
        onClick={handleSubmit}
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
        다음으로
      </Button>
    </Stack>
  )
}

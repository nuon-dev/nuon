"use client"

import { Box, IconButton, Stack } from "@mui/material"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { useRouter } from "next/navigation"
import usePageColor from "@/hooks/usePageColor"
import useBodyOverflowHidden from "@/hooks/useBodyOverflowHidden"
import useKakaoHook from "@/hooks/useKakao"

export default function RetreatLogin() {
  useBodyOverflowHidden()
  usePageColor("#2F3237")
  const { executeKakaoLogin } = useKakaoHook()
  const { push } = useRouter()

  async function handleKakaoLogin() {
    try {
      await executeKakaoLogin("/retreat/register")
    } catch {
      push("/retreat/search")
    }
  }

  function handleGoToBack() {
    push("/retreat")
  }

  return (
    <Stack
      width="100%"
      minHeight="100dvh"
      bgcolor="white"
      fontFamily="Pretendard"
      position="relative"
      overflow="hidden"
    >
      <IconButton
        onClick={handleGoToBack}
        aria-label="뒤로가기"
        sx={{
          position: "absolute",
          top: "calc(16px + env(safe-area-inset-top))",
          left: "16px",
          zIndex: 1,
          color: "#363232",
        }}
      >
        <ArrowBackIosNewRoundedIcon fontSize="small" />
      </IconButton>
      <Stack
        width="100%"
        justifyContent="center"
        minHeight="100dvh"
        alignItems="center"
        textAlign="center"
        gap="24px"
      >
        <Stack gap="10px" alignItems="center">
          <Box color="#E87C7C" fontSize="20px">
            반가워요!
          </Box>
          <Box color="#747073" fontSize="16px">
            로그인 후 신청을 시작할 수 있어요.
          </Box>
        </Stack>
        <img
          width="90%"
          alt="login bottom"
          src="/retreat/login/kakao.png"
          onClick={handleKakaoLogin}
        />
        <Stack position="absolute" alignItems="center" bottom="10%">
          <img
            width="50%"
            alt="bottom background"
            src="/retreat/login/Calling.png"
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

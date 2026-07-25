"use client"

import { Box, Button, IconButton, Stack } from "@mui/material"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { useRouter } from "next/navigation"
import axios from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"
import useRetreat from "../hooks/useRetreat"

export default function RetreatRegister() {
  const { push } = useRouter()
  const { success } = useNotification()
  const { isHalf, isWorker, setIsWorker } = useRetreat()
  function handleGoToBack() {
    push("/retreat")
  }

  async function handleSubmit() {
    push(`/retreat/participation-time`)
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
          직장인이신가요?
        </Box>
      </Stack>
      <Stack
        fontSize="15px"
        width="100%"
        direction="row"
        gap="12px"
        justifyContent="center"
      >
        <Box
          flex="1"
          bgcolor={isWorker ? "#FFD9D9" : "#E3E3E3"}
          display="flex"
          width="100px"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          border="1px solid #D1A5A5"
          borderRadius="8px"
          height="100px"
          onClick={() => {
            setIsWorker(true)
          }}
        >
          직장인이에요!
        </Box>
        <Box
          flex="1"
          display="flex"
          width="100px"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          border="1px solid #D1A5A5"
          borderRadius="8px"
          height="100px"
          bgcolor={isWorker ? "#E3E3E3" : "#FFD9D9"}
          onClick={() => {
            setIsWorker(false)
          }}
        >
          직장인 아니예요!
        </Box>
      </Stack>
      <Stack position="absolute" bottom="20px" width="90%">
        <Button
          sx={{
            bgcolor: "#FFAFAF",
            color: "#f8efe4",
            "&:hover": {
              bgcolor: "#694444",
            },
          }}
          onClick={handleSubmit}
        >
          신청하기
        </Button>
      </Stack>
    </Stack>
  )
}

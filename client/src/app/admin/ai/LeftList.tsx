"use client"

import useAuth from "@/hooks/useAuth"
import { Stack, Typography, Box } from "@mui/material"
import useAiChat from "./chat/useAiChat"
import { useEffect, useState } from "react"
import { AIChatRoom } from "@server/entity/ai/aiChatRoom"
import dayjs from "dayjs"

export default function AdminAIChatLeftComponent() {
  const { authUserData } = useAuth()
  const { getChatRooms, selectedChatRoomId, setSelectedChatRoomId } =
    useAiChat()
  const [chatRooms, setChatRooms] = useState<AIChatRoom[]>([])

  useEffect(() => {
    getChatRooms().then((res) => {
      setChatRooms(res.data)
    })
  }, [])

  return (
    <Stack
      width={280}
      height="100%"
      borderRight="1px solid #e0e0e0"
      bgcolor="#f8f9fa"
    >
      <Stack
        height={60}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        borderBottom="1px solid #e0e0e0"
        bgcolor="white"
      >
        <Typography variant="h6" fontWeight="bold">
          채팅 목록
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {authUserData?.name}님
        </Typography>
      </Stack>

      <Stack flex="1" overflow="auto" p={2} gap={1}>
        {/* 새 채팅 만들기 버튼 예시 (기능은 연결 안 함) */}
        {/* <Button
          startIcon={<AddCircleOutlineIcon />}
          fullWidth
          variant="outlined"
          sx={{ mb: 1, borderRadius: 2 }}
        >
          새 채팅
        </Button> */}

        {chatRooms.map((room) => (
          <Box
            key={room.id}
            onClick={() => setSelectedChatRoomId(room.id)}
            sx={{
              p: 2,
              cursor: "pointer",
              borderRadius: 2,
              bgcolor: selectedChatRoomId === room.id ? "white" : "transparent",
              boxShadow:
                selectedChatRoomId === room.id
                  ? "0 2px 4px rgba(0,0,0,0.05)"
                  : "none",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor:
                  selectedChatRoomId === room.id ? "white" : "rgba(0,0,0,0.04)",
              },
              border:
                selectedChatRoomId === room.id
                  ? "1px solid #e0e0e0"
                  : "1px solid transparent",
            }}
          >
            <Typography
              variant="subtitle2"
              noWrap
              color={
                selectedChatRoomId === room.id ? "primary.main" : "text.primary"
              }
              fontWeight={selectedChatRoomId === room.id ? "bold" : "normal"}
            >
              {room.title || "새로운 채팅"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              noWrap
            >
              {dayjs(room.createdAt).format("YY-MM-DD HH:mm")}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}

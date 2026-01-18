"use client"

import {
  Button,
  Stack,
  TextField,
  IconButton,
  Paper,
  Typography,
} from "@mui/material"
import AdminAIChatComponent from "./Chat"
import AdminAIChatLeftComponent from "../LeftList"
import useAuth from "@/hooks/useAuth"
import { useState } from "react"
import useAiChat from "./useAiChat"
import SendIcon from "@mui/icons-material/Send"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

export default function AdminAIChatPage() {
  const [message, setMessage] = useState("")
  const { sendMessageToAi, isAiReplying } = useAiChat()

  const handleSendMessage = async () => {
    if (!message.trim()) return
    const msg = message
    setMessage("") // 즉시 초기화
    await sendMessageToAi(msg)
  }

  return (
    <Stack height="100%">
      <Stack direction="row" flex="1" width="100%" height="100%">
        <AdminAIChatLeftComponent />
        <Stack flex="1" height="100%" overflow="hidden" direction="column">
          <Stack flex="1" overflow="auto" bgcolor="#f5f7f9">
            <AdminAIChatComponent />
          </Stack>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "white",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={0.5}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                사용가능한 토큰이 무제한이 아닙니다.
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center" width="100%">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="메시지를 입력하세요..."
                size="small"
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isAiReplying}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "#f8f9fa",
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!message.trim() || isAiReplying}
                sx={{
                  px: 3,
                  height: 40,
                  borderRadius: 3,
                  minWidth: "100px",
                }}
                endIcon={<SendIcon />}
              >
                전송
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  )
}

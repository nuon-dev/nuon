"use client"

import { Button, Stack, TextField, IconButton, Paper } from "@mui/material"
import AdminAIChatComponent from "./Chat"
import AdminAIChatLeftComponent from "../LeftList"
import useAuth from "@/hooks/useAuth"
import { useState } from "react"
import useAiChat from "./useAiChat"
import SendIcon from "@mui/icons-material/Send"

export default function AdminAIChatPage() {
  const [message, setMessage] = useState("")
  const { sendMessageToAi } = useAiChat()

  return (
    <Stack height="100%">
      <Stack direction="row" flex="1" width="100%" height="100%">
        <AdminAIChatLeftComponent />
        <Stack direction="column" flex="1" height="100%" overflow="hidden">
          <Stack flex="1" overflow="auto" bgcolor="#f5f7f9">
            <AdminAIChatComponent />
          </Stack>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "row",
              gap: 1,
              bgcolor: "white",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="메시지를 입력하세요..."
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessageToAi(message)
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#f8f9fa",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => sendMessageToAi(message)}
              disabled={!message.trim()}
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
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  )
}

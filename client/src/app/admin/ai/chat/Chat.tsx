"use client"

import { useState } from "react"
import useAiChat from "./useAiChat"
import { marked } from "marked"
import useAuth from "@/hooks/useAuth"
import { AIChat } from "@server/entity/ai/aiChat"
import { Button, Stack, TextField } from "@mui/material"

export enum ChatType {
  USER = "user",
  AI = "ai",
  SYSTEM = "system",
}

export default function AdminAIChatComponent() {
  const { authUserData } = useAuth()
  const [message, setMessage] = useState("")
  const { selectedChatRoom, sendMessageToAi } = useAiChat()

  return (
    <Stack flex={1} gap="12px" padding={2} border="1px solid #eee">
      <Stack>{authUserData?.name}님</Stack>
      <Stack
        gap="12px"
        display="flex"
        overflow="auto"
        maxHeight="calc(100vh - 300px)"
      >
        {selectedChatRoom &&
          selectedChatRoom.chats &&
          selectedChatRoom.chats.map((chat) => (
            <ChatComponent key={chat.id} chat={chat} />
          ))}
      </Stack>
      <Stack direction="row" gap="12px">
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={() => sendMessageToAi(message)} variant="contained">
          전송
        </Button>
      </Stack>
    </Stack>
  )
}

function ChatComponent({ chat }: { chat: AIChat }) {
  return (
    <Stack
      direction="row"
      justifyContent={chat.type === ChatType.USER ? "flex-end" : "flex-start"}
    >
      <Stack
        maxWidth="70%"
        padding="12px"
        borderRadius="8px"
        border="1px solid #eee"
        bgcolor={chat.type === ChatType.USER ? "#daf1da" : "#f1f1f1"}
        textAlign={chat.type === ChatType.USER ? "right" : "left"}
      >
        <div dangerouslySetInnerHTML={{ __html: marked.parse(chat.message) }} />
      </Stack>
    </Stack>
  )
}

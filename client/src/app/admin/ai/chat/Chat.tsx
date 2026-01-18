"use client"

import useAiChat from "./useAiChat"
import { marked } from "marked"
import { AIChat } from "@server/entity/ai/aiChat"
import { Box, Stack, Typography, Avatar } from "@mui/material"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import PersonIcon from "@mui/icons-material/Person"

export enum ChatType {
  USER = "user",
  AI = "ai",
  SYSTEM = "system",
}

export default function AdminAIChatComponent() {
  const { selectedChatRoom } = useAiChat()

  return (
    <Stack gap={2} padding={2} minHeight="100%" bgcolor="#f5f7f9">
      {selectedChatRoom &&
        selectedChatRoom.chats &&
        selectedChatRoom.chats.map((chat) => (
          <ChatComponent key={chat.id} chat={chat} />
        ))}
    </Stack>
  )
}

function ChatComponent({ chat }: { chat: AIChat }) {
  const isUser = chat.type === ChatType.USER

  return (
    <Stack
      direction={isUser ? "row-reverse" : "row"}
      alignItems="flex-start"
      gap={2}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? "primary.main" : "secondary.main",
          width: 32,
          height: 32,
        }}
      >
        {isUser ? (
          <PersonIcon fontSize="small" />
        ) : (
          <SmartToyIcon fontSize="small" />
        )}
      </Avatar>

      <Box
        maxWidth="70%"
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: isUser ? "primary.main" : "white",
          color: isUser ? "white" : "text.primary",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // 부드러운 그림자
          borderTopRightRadius: isUser ? 0 : 2, // 말풍선 꼬리 느낌 (선택)
          borderTopLeftRadius: !isUser ? 0 : 2,
          "& a": { color: isUser ? "#fff" : "primary.main" }, // 링크 색상 조정
          "& code": {
            fontFamily: "monospace",
            bgcolor: isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
            borderRadius: 1,
            px: 0.5,
          },
          "& pre": {
            bgcolor: isUser ? "rgba(0,0,0,0.2)" : "#f5f5f5",
            p: 1,
            borderRadius: 1,
            overflow: "auto",
          },
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: marked.parse(chat.message) }}
          style={{ lineHeight: 1.6, fontSize: "0.95rem" }}
        />
      </Box>
    </Stack>
  )
}

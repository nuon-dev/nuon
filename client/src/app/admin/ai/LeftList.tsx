"use client"

import { Stack } from "@mui/material"
import useAiChat from "./chat/useAiChat"
import { useEffect, useState } from "react"
import { AIChatRoom } from "@server/entity/ai/aiChatRoom"

export default function AdminAIChatLeftComponent() {
  const { getChatRooms, selectedChatRoomId, setSelectedChatRoomId } =
    useAiChat()
  const [chatRooms, setChatRooms] = useState<AIChatRoom[]>([])

  useEffect(() => {
    getChatRooms().then((res) => {
      setChatRooms(res.data)
    })
  }, [])

  return (
    <Stack minWidth="15%" padding={2} border="1px solid #eee">
      {chatRooms.map((room) => (
        <Stack
          key={room.id}
          padding={1}
          borderBottom="1px solid #eee"
          onClick={() => setSelectedChatRoomId(room.id)}
          bgcolor={selectedChatRoomId === room.id ? "#eee" : "transparent"}
        >
          {room.title}
        </Stack>
      ))}{" "}
    </Stack>
  )
}

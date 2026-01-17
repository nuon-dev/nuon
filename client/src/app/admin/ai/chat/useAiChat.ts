"use client"

import axios from "@/config/axios"
import { AIChatRoom } from "@server/entity/ai/aiChatRoom"
import { atom, useAtom } from "jotai"
import { useEffect } from "react"

const SelectedAiCharRoomIdAtom = atom<string>("")
const SelectedAiCharRoomAtom = atom<AIChatRoom | null>(null)

export default function useAiChat() {
  const [selectedChatRoom, setSelectedChatRoom] = useAtom(
    SelectedAiCharRoomAtom
  )
  const [selectedChatRoomId, setSelectedChatRoomId] = useAtom(
    SelectedAiCharRoomIdAtom
  )

  useEffect(() => {
    if (selectedChatRoomId) {
      getRoomData(selectedChatRoomId)
    }
  }, [selectedChatRoomId])

  async function getChatRooms() {
    return await axios.get("/admin/ai/my-rooms")
  }

  async function sendMessageToAi(message: string) {
    const response = await axios.post("/admin/ai/ask", {
      message: message,
      roomId: selectedChatRoomId,
    })
    setSelectedChatRoom(response.data)
  }

  async function getRoomData(roomId: string) {
    const response = await axios.get(`/admin/ai/room/${roomId}`)
    setSelectedChatRoom(response.data)
  }

  return {
    getChatRooms,
    sendMessageToAi,
    selectedChatRoom,
    setSelectedChatRoom,
    selectedChatRoomId,
    setSelectedChatRoomId,
  }
}

"use client"

import axios from "@/config/axios"
import { AIChatRoom } from "@server/entity/ai/aiChatRoom"
import { atom, useAtom } from "jotai"
import { useEffect } from "react"

const SelectedAiCharRoomIdAtom = atom<string>("")
const SelectedAiCharRoomAtom = atom<AIChatRoom | null>(null)
const AiChatRoomsAtom = atom<AIChatRoom[]>([])
const IsAiReplyingAtom = atom<boolean>(false)

export default function useAiChat() {
  const [selectedChatRoom, setSelectedChatRoom] = useAtom(
    SelectedAiCharRoomAtom,
  )
  const [selectedChatRoomId, setSelectedChatRoomId] = useAtom(
    SelectedAiCharRoomIdAtom,
  )
  const [chatRooms, setChatRooms] = useAtom(AiChatRoomsAtom)
  const [isAiReplying, setIsAiReplying] = useAtom(IsAiReplyingAtom)

  useEffect(() => {
    if (selectedChatRoomId) {
      getRoomData(selectedChatRoomId)
    }
  }, [selectedChatRoomId])

  async function getChatRooms() {
    const response = await axios.get("/admin/ai/my-rooms")
    setChatRooms(response.data)
    return response
  }

  async function sendMessageToAi(message: string) {
    // Optimistic Update: 사용자 메시지를 미리 보여줌
    const tempUserChat: any = {
      id: `temp-${Date.now()}`,
      message,
      type: "user",
      createdAt: new Date(),
    }

    setSelectedChatRoom((prev) => {
      if (!prev) {
        // 새 채팅방인 경우 임시 방 생성
        return {
          id: "temp-room",
          title: "New Chat",
          chats: [tempUserChat],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as AIChatRoom
      }
      return {
        ...prev,
        chats: [...(prev.chats || []), tempUserChat],
      }
    })

    setIsAiReplying(true)
    try {
      const response = await axios.post("/admin/ai/ask", {
        message: message,
        roomId: selectedChatRoomId,
      })
      setSelectedChatRoom(response.data)

      if (!selectedChatRoomId || selectedChatRoomId !== response.data.id) {
        setSelectedChatRoomId(response.data.id)
        getChatRooms()
      } else {
        // 이미 룸이 있어도 채팅 업데이트를 위해 리스트 갱신 (마지막 메세지, 시간 등)
        getChatRooms()
      }
    } finally {
      setIsAiReplying(false)
    }
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
    chatRooms,
    isAiReplying,
  }
}

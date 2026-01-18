import { Router } from "express"
import { getUserFromToken, hasPermissionFromReq } from "../../util/util"
import AiModel from "../../model/ai"
import { AIChat, ChatType } from "../../entity/ai/aiChat"
import { aiChatRoomDatabase } from "../../model/dataSource"
import { PermissionType } from "../../entity/types"

const router = Router()

router.post("/ask", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
  if (!isAdmin) {
    res.status(403).json({ message: "Forbidden" })
    return
  }

  const userRequestMessage = req.body.message
  let roomId: string = req.body.roomId
  if (!roomId) {
    const newRoom = await AiModel.createNewRoom(user, userRequestMessage)
    roomId = newRoom.id
  }

  const chatRoom = await AiModel.getChatRoom(roomId, true)

  const requestChat = new AIChat()
  requestChat.room = chatRoom
  requestChat.type = ChatType.USER
  requestChat.message = userRequestMessage
  requestChat.createdAt = new Date()
  chatRoom.chats.push(requestChat)

  let responseChat: AIChat
  do {
    responseChat = await AiModel.requestChatAI(chatRoom.chats)
    responseChat.room = chatRoom
    responseChat.createdAt = new Date()
    if (responseChat.message.includes("```sql")) {
      console.log("query:", responseChat.message)
      responseChat.type = ChatType.SYSTEM // 쿼리는 시스템으로 저장
      chatRoom.chats.push(responseChat)
      const sqlResult = await AiModel.callSql(responseChat.message)
      const queryResult = JSON.stringify(sqlResult, null, 2).slice(0, 3000)
      const queryChat = new AIChat()
      queryChat.room = chatRoom
      queryChat.type = ChatType.SYSTEM
      queryChat.message = `Query Result:\n${queryResult}`
      queryChat.createdAt = new Date()
      chatRoom.chats.push(queryChat)
      continue
    }
    responseChat.type = ChatType.AI
    chatRoom.chats.push(responseChat)
  } while (responseChat.message.includes("```sql"))

  await aiChatRoomDatabase.save(chatRoom)

  const savedChatRoom = await AiModel.getChatRoom(roomId, false)
  savedChatRoom.chats.forEach((chat) => {
    delete chat.room
  })
  res.json(savedChatRoom)
})

router.get("/my-rooms", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const rooms = await AiModel.getUserRooms(user)
  res.json(rooms)
})

router.get("/room/:roomId", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const roomId: string = req.params.roomId as string
  const chatRoom = await AiModel.getChatRoom(roomId)
  if (chatRoom.user.id !== user.id) {
    res.status(403).json({ message: "Forbidden" })
    return
  }

  res.json(chatRoom)
})

export default router

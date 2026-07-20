"use client"

import { Button, MenuItem, Select, Stack, TextField } from "@mui/material"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { get } from "@/config/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"

export default function PostcardPage() {
  const { push } = useRouter()
  const [groupName, setGroupName] = useState("")
  const [soonList, setSoonList] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [textFieldValue, setTextFieldValue] = useState("")
  const [localStorageData, setLocalStorageData] = useState<{
    userId: string
    text: string
  } | null>(null)
  const { success } = useNotification()

  useEffect(() => {
    fetchGroupDate()
    getLocalStorageData()
  }, [])

  function getLocalStorageData() {
    const data = localStorage.getItem("postcardData")
    if (data) {
      const parsedData = JSON.parse(data)
      if (parsedData.userId && parsedData.text) {
        setLocalStorageData(parsedData)
      }
    }
  }

  useEffect(() => {
    if (!localStorageData) {
      return
    }
    if (!selectedUser) {
      return
    }
    if (localStorageData.userId == selectedUser.id) {
      setTextFieldValue(localStorageData.text)
      return
    }
    setTextFieldValue("") // 다른 사용자를 선택하면 텍스트 필드 초기화
  }, [localStorageData, selectedUser])

  async function fetchGroupDate() {
    const group: Community = await get("/soon/only-my-group-info")
    setGroupName(group.name)
    setSoonList(group.users)
    if (group.users.length > 0) {
      setSelectedUser(group.users[0]) // 기본으로 첫 번째 사용자 선택
    }
  }

  function saveToLocalStorage() {
    if (!selectedUser) return
    const postcardData = {
      userId: selectedUser.id,
      text: textFieldValue,
    }
    localStorage.setItem("postcardData", JSON.stringify(postcardData))
  }

  function previewPostcard() {
    saveToLocalStorage()
    push("/retreat/postcard/preview")
  }

  async function saveToServer() {
    await axios.post("/retreat/set-postcard-content", {
      content: textFieldValue,
      targetUserId: selectedUser?.id,
    })
    localStorage.removeItem("postcardData")
    success("저장되었습니다.")
  }

  async function getCardContentFromServer() {
    if (!selectedUser) return
    try {
      const response = await axios.get(
        `/retreat/get-postcard-content/${selectedUser.id}`,
      )
      setTextFieldValue(response.data.content || "")
    } catch (error) {
      setTextFieldValue("") // 서버에서 가져오지 못하면 텍스트 필드 초기화
    }
  }

  useEffect(() => {
    getCardContentFromServer()
  }, [selectedUser])

  return (
    <Stack>
      <Stack p="12px" gap="12px">
        <Stack
          px="12px"
          py="10px"
          borderRadius="12px"
          bgcolor="#f5f7ff"
          color="#1f2a44"
          fontSize="14px"
          fontWeight={500}
          lineHeight={1.6}
        >
          수련회를 어떠한 마음으로 참여하면 좋을지 격려의 편지를 적어주세요!.
          접수 완료후 편지가 나타납니다!
        </Stack>
        <Stack>{groupName} (다락방 / 마을)</Stack>
        <Select
          value={selectedUser?.id || ""}
          onChange={(e) => {
            const userId = e.target.value
            const user = soonList.find((u) => u.id === userId)
            setSelectedUser(user)
          }}
        >
          {soonList.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name} ({user.gender === "man" ? "남" : "여"}) (
              {user.yearOfBirth})
            </MenuItem>
          ))}
        </Select>
        <TextField
          multiline
          rows={10}
          fullWidth
          value={textFieldValue}
          placeholder="편지 내용을 입력하세요"
          onChange={(e) => setTextFieldValue(e.target.value)}
          onClick={(e) => {
            const target = e.target as HTMLInputElement
            target.value = textFieldValue
          }}
        />
        <Button variant="outlined" color="info" onClick={previewPostcard}>
          미리보기
        </Button>
        <Button variant="outlined" color="success" onClick={saveToServer}>
          저장하기
        </Button>
      </Stack>
    </Stack>
  )
}

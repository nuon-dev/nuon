"use client"

import { Button, MenuItem, Select, Stack, TextField } from "@mui/material"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { get } from "@/config/api"
import { useEffect, useState } from "react"
import Header from "@/app/leader/components/Header"
import { useRouter } from "next/navigation"
import axios from "@/config/axios"
import { useAtom, useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"

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
  const setNotificationMessage = useSetAtom(NotificationMessage)

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
    const group: Community = await get("/soon/my-group-info")
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
    push("/soon/postcard/preview")
  }

  async function saveToServer() {
    await axios.post("/retreat/set-postcard-content", {
      content: textFieldValue,
      targetUserId: selectedUser?.id,
    })
    localStorage.removeItem("postcardData")
    setNotificationMessage("저장되었습니다.")
  }

  return (
    <Stack>
      <Header />
      <Stack p="12px" gap="12px">
        <Stack>{groupName} 다락방</Stack>
        작성할 순원
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

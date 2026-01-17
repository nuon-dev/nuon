"use client"

import useAuth from "@/hooks/useAuth"
import { Stack } from "@mui/material"

export default function AdminAIChatComponent() {
  const { authUserData } = useAuth()

  return (
    <Stack>
      <Stack>{authUserData?.name}님</Stack>
      <Stack>
        <ChatComponent />
      </Stack>
    </Stack>
  )
}

function ChatComponent() {
  return <div>Chat Component</div>
}

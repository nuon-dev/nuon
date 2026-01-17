"use client"

import { Stack } from "@mui/material"
import AdminAIChatComponent from "./Chat"
import AdminAIChatLeftComponent from "./leftList"

export default function AdminAIChatPage() {
  return (
    <Stack>
      <Stack direction="row" spacing={2}>
        <AdminAIChatLeftComponent />
        <AdminAIChatComponent />
      </Stack>
    </Stack>
  )
}

"use client"

import Header from "@/app/admin/components/Header"
import { Stack } from "@mui/material"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Stack height="100vh">
      <Header />
      <Stack component="main" flex={1} overflow="auto">
        {children}
      </Stack>
    </Stack>
  )
}

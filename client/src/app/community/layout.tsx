"use client"

import Header from "@/components/Header"
import { Stack } from "@mui/material"

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Stack>
      <Header />
      {children}
    </Stack>
  )
}

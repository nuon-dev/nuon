"use client"

import { Box, Stack } from "@mui/material"
import { Suspense } from "react"
import usePageColor from "@/hooks/usePageColor"
import Header from "./components/Header"
import RetreatMainFirst from "./sections/first"
import RetreatMainSecond from "./sections/second"
import RetreatThird from "./sections/third"
import RetreatMainFourth from "./sections/fourth"

export default function RetreatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RetreatContent />
    </Suspense>
  )
}

function RetreatContent() {
  usePageColor("#2F3237")

  return (
    <Stack
      width="100%"
      minHeight="100dvh"
      bgcolor="#363232"
      fontFamily="Pretendard"
      sx={{
        overflowX: "hidden",
        boxSizing: "border-box",
        pt: "calc(76px + env(safe-area-inset-top))",
      }}
    >
      <Header />
      <RetreatMainFirst />
      <RetreatMainSecond />
      <Box height="500px" />
      <RetreatThird />
      <Box height="500px" />
      <RetreatMainFourth />
      <img src="/retreat/main/fifth/bottom.png" width="100%" alt="Bottom" />
    </Stack>
  )
}

"use client"

import { Stack } from "@mui/material"

export default function RetreatHeader() {
  return (
    <Stack
      width="100%"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        minHeight: "calc(76px + env(safe-area-inset-top))",
        pt: "env(safe-area-inset-top)",
        background:
          "linear-gradient(to right, #363232 0%, #504A4A 39% , #9C9090 100%)",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        width="90%"
        zIndex={40}
      >
        <img src="/retreat/header/Calling.png" alt="Calling" width="94px" />
        <img
          src="/retreat/header/regist_button.png"
          alt="regist_button"
          height="30px"
        />
      </Stack>
    </Stack>
  )
}

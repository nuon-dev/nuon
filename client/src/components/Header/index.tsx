"use client"

import { useState } from "react"
import HeaderDrawer from "./Drawer"
import { useRouter } from "next/navigation"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

export default function Header() {
  const { push } = useRouter()
  const [isOpen, setOpen] = useState(false)

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/")
  }

  return (
    <Stack
      py="8px"
      width="100%"
      display="flex"
      flexDirection="row"
      bgcolor="#42C7F1"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
      >
        <Button onClick={goToHome}>
          <img width="80px" src="/logo_white.png" />
        </Button>
        <Button
          onClick={() => toggleDrawer(true)}
          sx={{
            minWidth: "auto",
            p: 1,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <MenuIcon
            sx={{
              color: "white",
              fontSize: 28,
            }}
          />
        </Button>
      </Stack>
      <HeaderDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
    </Stack>
  )
}

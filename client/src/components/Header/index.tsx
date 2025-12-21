"use client"

import { useState } from "react"
import HeaderDrawer, { DrawerItemsType } from "./Drawer"
import { useRouter } from "next/navigation"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PeopleIcon from "@mui/icons-material/People"
import useAuth from "@/hooks/useAuth"

export default function Header() {
  const { push } = useRouter()
  const { authUserData } = useAuth()
  const [isOpen, setOpen] = useState(false)

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/")
  }
  const DrawerItems: Array<DrawerItemsType> = [
    {
      title: "나의 정보 수정",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/common/myPage",
      type: "menu",
    },
    { type: "divider" },
    {
      title: "투표하러 가기",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/event/worshipContest/main",
      type: "menu",
    },
  ]

  if (authUserData?.role.Leader) {
    DrawerItems.push({
      type: "divider",
    })
    DrawerItems.push({
      title: "순장 화면",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader",
      type: "menu",
    })
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
      <HeaderDrawer
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        DrawerItems={DrawerItems}
      />
    </Stack>
  )
}

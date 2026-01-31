"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PeopleIcon from "@mui/icons-material/People"
import HeaderDrawer, { DrawerItemsType } from "@/components/Header/Drawer"
import EventNoteIcon from "@mui/icons-material/EventNote"
import HowToRegIcon from "@mui/icons-material/HowToReg"
import useAuth from "@/hooks/useAuth"

export default function Header() {
  const { push } = useRouter()
  const { authUserData } = useAuth()
  const [isOpen, setOpen] = useState(false)

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/leader")
  }

  const menu: DrawerItemsType[] = [
    {
      title: "순원 관리",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/management",
      type: "menu",
    },
    {
      title: "출석 관리",
      icon: <EventNoteIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/attendance",
      type: "menu",
    },
    {
      title: "새신자 관리",
      icon: <HowToRegIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/newcomer",
      type: "menu",
    },
    {
      title: "담당자 관리",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/newcomer/managers",
      type: "menu",
    },
    {
      title: "순원 수련회 접수 조회",
      icon: <HowToRegIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/retreat-attendance",
      type: "menu",
    },
  ]

  if (authUserData?.role.VillageLeader) {
    menu.push({
      title: "전체 출석 조회",
      icon: <EventNoteIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/all-attendance",
      type: "menu",
    })
  }

  return (
    <Stack
      py="8px"
      width="100%"
      flexDirection="row"
      bgcolor="#42C7F1"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack flexDirection="row" alignItems="center" gap="8px">
        <Button onClick={goToHome}>
          <img width="80px" src="/logo_white.png" />
        </Button>
        <Stack fontSize="32px" fontWeight="bold" color="white">
          순장
        </Stack>
      </Stack>
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
      <HeaderDrawer
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        DrawerItems={menu}
      />
    </Stack>
  )
}

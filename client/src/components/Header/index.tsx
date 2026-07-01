"use client"

import { useState } from "react"
import HeaderDrawer, { DrawerItemsType } from "./Drawer"
import { useRouter } from "next/navigation"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import ForumIcon from "@mui/icons-material/Forum"
import useAuth from "@/hooks/useAuth"
import HowToRegIcon from "@mui/icons-material/HowToReg"
import useBoard from "./useBoard"

export default function Header() {
  const { push } = useRouter()
  const { authUserData, isLogin } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const { boards } = useBoard()

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/")
  }

  const DrawerItems: Array<DrawerItemsType> = []

  if (isLogin) {
    DrawerItems.push({
      title: "나의 정보 수정",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/common/myPage",
      type: "menu",
    })
    DrawerItems.push({
      type: "divider",
    })
    console.log("boards", boards)
    for (const board of boards) {
      DrawerItems.push({
        title: board.name,
        icon: <ForumIcon fontSize="small" sx={{ color: "#42a5f5" }} />,
        path: `/community/?slug=${encodeURIComponent(board.slug)}`,
        type: "menu",
      } as DrawerItemsType)
    }
  }

  if (authUserData?.role.Leader) {
    DrawerItems.push({
      type: "divider",
    })
    DrawerItems.push({
      type: "menu",
    })
  }

  if (authUserData?.role.Leader) {
    DrawerItems.push({
      type: "divider",
    })
    DrawerItems.push({
      title: "순원 관리",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/management",
      type: "menu",
    })
    DrawerItems.push({
      title: "출석 관리",
      icon: <EventNoteIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/attendance",
      type: "menu",
    })

    if (authUserData?.role.VillageLeader) {
      DrawerItems.push({
        title: "전체 출석 조회",
        icon: <EventNoteIcon fontSize="small" sx={{ color: "#667eea" }} />,
        path: "/leader/all-attendance",
        type: "menu",
      })
    }

    if (authUserData?.role.NewcomerManager || authUserData?.role.Admin) {
      DrawerItems.push({
        title: "새가족 관리",
        icon: <HowToRegIcon fontSize="small" sx={{ color: "#667eea" }} />,
        path: "/leader/newcomer/management",
        type: "menu",
      })
    }
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

"use client"

import { useState } from "react"
import HeaderDrawer, { DrawerItemsType } from "./Drawer"
import { useRouter } from "next/navigation"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import useAuth from "@/hooks/useAuth"
import HowToRegIcon from "@mui/icons-material/HowToReg"

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
    /*Todo: 수련회 신청 기간에 맞춰서 다시 열기 
    { type: "divider" },
    {
      title: "2026 겨울 수련회 신청",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/retreat",
      type: "menu",
    },
    */
  ]

  if (authUserData?.role.Leader) {
    DrawerItems.push({
      type: "divider",
    })
    ;(DrawerItems.push({
      title: "순원 관리",
      icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/management",
      type: "menu",
    }),
      DrawerItems.push({
        title: "출석 관리",
        icon: <EventNoteIcon fontSize="small" sx={{ color: "#667eea" }} />,
        path: "/leader/attendance",
        type: "menu",
      }))
    /*Todo: 다음 수련회때 다시 키기
    {
      title: "순원 수련회 접수 조회",
      icon: <HowToRegIcon fontSize="small" sx={{ color: "#667eea" }} />,
      path: "/leader/retreat-attendance",
      type: "menu",
    },*/

    if (authUserData?.role.VillageLeader || authUserData?.role.Admin) {
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

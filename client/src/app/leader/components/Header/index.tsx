"use client"

import { Button, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import MenuIcon from "@mui/icons-material/Menu"
import { useRouter } from "next/navigation"

import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import useUserData from "@/hooks/useUserData"
import { jwtPayload } from "@/hooks/useAuth"
import HeaderDrawer from "@/components/Header/Drawer"

export default function Header() {
  const { push } = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<jwtPayload | undefined>(undefined) // Assuming User type is defined somewhere
  const { getUserDataFromToken } = useUserData()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const myRole = await getUserDataFromToken()
    if (!myRole) {
      return
    }
    setUserInfo(myRole)
  }

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/leader")
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
        DrawerItems={[
          {
            title: "순원 관리",
            icon: <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />,
            path: "/leader/management",
            type: "menu",
          },
          {
            title: "출석 관리",
            icon: <EventNoteIcon fontSize="small" sx={{ color: "#4facfe" }} />,
            path: "/leader/attendance",
            type: "menu",
          },
        ]}
      />
    </Stack>
  )
}

"use client"

import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material"
import { useEffect, useState } from "react"
import MenuIcon from "@mui/icons-material/Menu"
import { useRouter } from "next/navigation"

import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import useUserData from "@/hooks/useUserData"
import { jwtPayload } from "@/hooks/useAuth"
import UserInformation from "@/components/Header/UserInformation"

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

  function goToSoonManage() {
    push("/leader/management")
  }

  function goToSoonAttendance() {
    push("/leader/attendance")
  }

  function goToPostcard() {
    push("/leader/postcard")
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
      <Drawer
        open={isOpen}
        onClose={() => toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            borderRadius: "0 16px 16px 0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
        >
          <UserInformation />
          <List sx={{ px: 1 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={goToSoonManage}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />
                </ListItemIcon>
                <ListItemText
                  primary={"순원 관리"}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={goToSoonAttendance}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EventNoteIcon fontSize="small" sx={{ color: "#4facfe" }} />
                </ListItemIcon>
                <ListItemText
                  primary={"출석 관리"}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Stack>
  )
}

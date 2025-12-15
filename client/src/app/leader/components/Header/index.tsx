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
import useUserData, { jwtPayload } from "@/hooks/useUserData"

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
    push("/")
  }

  function UserInfo() {
    if (!userInfo) {
      return null
    }
    return (
      <Stack>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
            textAlign: "center",
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              {userInfo.name.charAt(0)}
            </Box>
            <Stack>
              <Box sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                {userInfo.name}
              </Box>
              <Box sx={{ fontSize: "0.9rem", opacity: 0.8 }}>
                {userInfo.yearOfBirth}년생
              </Box>
            </Stack>
          </Stack>
        </Box>
        <Divider />
      </Stack>
    )
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
          <UserInfo />
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

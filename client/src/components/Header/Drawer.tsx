"use client"

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { useRouter } from "next/navigation"
import UserInformation from "./UserInformation"
import useAuth from "@/hooks/useAuth"
import LogoutIcon from "@mui/icons-material/Logout"

interface HeaderDrawerProps {
  isOpen: boolean
  toggleDrawer: (value: boolean) => void
  DrawerItems: Array<DrawerItemsType>
}

export interface DrawerItemsType {
  title?: string
  icon?: React.ReactNode
  path?: string
  type: "divider" | "menu"
}

export default function HeaderDrawer({
  isOpen,
  toggleDrawer,
  DrawerItems,
}: HeaderDrawerProps) {
  const { push } = useRouter()
  const { logout, isLogin } = useAuth()

  function goToPage(path?: string) {
    push(path || "/")
  }

  return (
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
          {DrawerItems.map((item, index) => {
            if (item.type === "divider") {
              return <Divider key={index} />
            } else if (item.type === "menu") {
              return (
                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => goToPage(item.path)}
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
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              )
            }
          })}
          {isLogin && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={logout}
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
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="로그아웃" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  )
}

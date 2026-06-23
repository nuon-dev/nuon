"use client"

import {
  Box,
  Collapse,
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
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import { useState } from "react"

interface HeaderDrawerProps {
  isOpen: boolean
  toggleDrawer: (value: boolean) => void
  DrawerItems: Array<DrawerItemsType>
}

export interface DrawerItemsType {
  title?: string
  icon?: React.ReactNode
  path?: string
  type: "divider" | "menu" | "submenu"
  children?: Array<DrawerItemsType>
}

function DrawerList({ DrawerItems }: { DrawerItems: Array<DrawerItemsType> }) {
  const { push } = useRouter()

  const [open, setOpen] = useState(false)

  function goToPage(path?: string) {
    push(path || "/")
  }

  function toggleSubMenu(e: React.MouseEvent<HTMLDivElement>) {
    setOpen(!open)
    e.stopPropagation()
  }

  return (
    <div>
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
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          )
        } else if (item.type === "submenu" && item.children) {
          return (
            <div>
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton onClick={toggleSubMenu}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse key={index} in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <DrawerList key={index} DrawerItems={item.children} />
                </List>
              </Collapse>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default function HeaderDrawer({
  isOpen,
  toggleDrawer,
  DrawerItems,
}: HeaderDrawerProps) {
  const { logout, isLogin } = useAuth()

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
          <DrawerList DrawerItems={DrawerItems} />
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

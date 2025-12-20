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
import PeopleIcon from "@mui/icons-material/People"

interface HeaderDrawerProps {
  isOpen: boolean
  toggleDrawer: (value: boolean) => void
}

interface DrawerItemsType {
  title?: string
  icon?: React.ReactNode
  path?: string
  type: "divider" | "menu"
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

export default function HeaderDrawer({
  isOpen,
  toggleDrawer,
}: HeaderDrawerProps) {
  const { push } = useRouter()

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
                <ListItem disablePadding sx={{ mb: 1 }}>
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
        </List>
      </Box>
    </Drawer>
  )
}

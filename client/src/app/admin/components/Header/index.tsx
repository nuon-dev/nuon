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

import useAuth from "@/hooks/useAuth"
import EventIcon from "@mui/icons-material/Event"
import BusinessIcon from "@mui/icons-material/Business"
import CommunitysIcon from "@mui/icons-material/Groups"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"
import HeaderDrawer, { DrawerItemsType } from "@/components/Header/Drawer"
import path from "path"

export default function AdminHeader() {
  const { isAdminIfNotExit } = useAuth()
  const { push } = useRouter()
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    isAdminIfNotExit("/admin")
  }, [])

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/admin")
  }

  function goToEditAllSoonList() {
    push("/admin/soon")
  }

  function goToDarakCommunityManagement() {
    push("/admin/darak/community")
  }

  function goToDarakPeopleManagement() {
    push("/admin/darak/people")
  }

  function goToWorshipSchedule() {
    push("/admin/worshipSchedule")
  }

  function goToWorshipAttendance() {
    push("/admin/soon/attendance")
  }

  function goToEventWorshipContest() {
    push("/admin/event/worshipContest")
  }
  const DrawerItems: Array<DrawerItemsType> = [
    {
      title: "순 관리",
      icon: <CommunitysIcon fontSize="small" />,
      path: "/admin/soon",
      type: "menu",
    },
    {
      title: "다락방 그룹 관리",
      icon: <BusinessIcon fontSize="small" />,
      path: "/admin/darak/community",
      type: "menu",
    },
    {
      title: "다락방 인원 관리",
      icon: <PeopleOutlineOutlinedIcon fontSize="small" />,
      path: "/admin/darak/people",
      type: "menu",
    },
    {
      title: "예배 관리",
      icon: <EventIcon fontSize="small" />,
      path: "/admin/worshipSchedule",
      type: "menu",
    },
    {
      title: "출석 관리",
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      path: "/admin/soon/attendance",
      type: "menu",
    },
    {
      type: "divider",
    },
    {
      title: "워십 콘테스트",
      icon: <EventIcon fontSize="small" />,
      path: "/admin/event/worshipContest",
      type: "menu",
    },
  ]

  return (
    <Stack
      padding="8px"
      direction="row"
      bgcolor="#42C7F1"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" alignItems="center" gap="8px">
        <Button onClick={goToHome}>
          <img width="80px" src="/logo_white.png" />
        </Button>
        <Stack fontSize="32px" fontWeight="bold" color="white">
          관리자
        </Stack>
      </Stack>
      <Button onClick={() => toggleDrawer(true)}>
        <MenuIcon
          color="action"
          style={{
            width: "40px",
            height: "36px",
          }}
        />
      </Button>
      <HeaderDrawer
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        DrawerItems={DrawerItems}
      />
    </Stack>
  )
}

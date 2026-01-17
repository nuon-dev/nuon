import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button, Stack } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import EventIcon from "@mui/icons-material/Event"
import BusinessIcon from "@mui/icons-material/Business"
import CommunityIcon from "@mui/icons-material/Groups"
import HeaderDrawer, { DrawerItemsType } from "@/components/Header/Drawer"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"

export default function AdminHeader() {
  const { push } = useRouter()
  const { isAdminIfNotExit } = useAuth()
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    let path = "/admin"
    if (global && global.location && global.location.pathname) {
      path = global.location.pathname
    }
    isAdminIfNotExit(path)
  }, [])

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/admin")
  }

  const DrawerItems: Array<DrawerItemsType> = [
    {
      title: "순 관리",
      icon: <CommunityIcon fontSize="small" />,
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
      title: "AI로 데이터 분석",
      icon: <AutoAwesomeIcon fontSize="small" />,
      path: "/admin/ai/chat",
      type: "menu",
    },
    {
      type: "divider",
    },
    /* Todo: 지울지, 유지할지 결정 필요
    {
      title: "워십 콘테스트",
      icon: <EventIcon fontSize="small" />,
      path: "/admin/event/worshipContest",
      type: "menu",
    },
    */
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

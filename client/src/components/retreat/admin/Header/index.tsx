import {
  Box,
  Button,
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
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import ListIcon from "@mui/icons-material/List"
import BedtimeIcon from "@mui/icons-material/Bedtime"
import GroupsIcon from "@mui/icons-material/Groups"
import LockIcon from "@mui/icons-material/Lock"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import EditIcon from "@mui/icons-material/Edit"
import QrCode2Icon from "@mui/icons-material/QrCode2"
import TableChartIcon from "@mui/icons-material/TableChart"
import LoginIcon from "@mui/icons-material/Login"
import DashboardIcon from "@mui/icons-material/Dashboard"
import { useRouter } from "next/navigation"

import useUserData from "@/hooks/useUserData"

export default function Header() {
  const { getUserDataFromToken } = useUserData()
  const { push } = useRouter()
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const myRole = await getUserDataFromToken()
    if (!myRole) {
      return
    }
  }

  function toggleDrawer(value: boolean) {
    setOpen(value)
  }

  function goToHome() {
    push("/retreat/admin")
  }

  function RouterRow({
    pageURL,
    pageName,
    icon: IconComponent,
  }: {
    pageURL: string
    pageName: string
    icon: React.ElementType
  }) {
    function goToPage() {
      push("/retreat/admin" + pageURL)
    }
    return (
      <ListItem disablePadding>
        <ListItemButton onClick={goToPage}>
          <ListItemIcon>
            <IconComponent sx={{ fontSize: 28 }} />
          </ListItemIcon>
          <ListItemText primary={pageName} />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <Stack
      width="100%"
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
          수련회 관리자
        </Stack>
      </Stack>
      <Button onClick={() => toggleDrawer(true)}>
        <MenuIcon
          sx={{
            color: "white",
            width: "40px",
            height: "36px",
          }}
        />
      </Button>
      <Drawer open={isOpen} onClose={() => toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
        >
          <List>
            {RouterRow({
              pageName: "접수자 전체 조회",
              pageURL: "/all-user",
              icon: FormatListBulletedIcon,
            })}
            {RouterRow({
              pageName: "카풀 관리",
              pageURL: "/carpooling",
              icon: DirectionsCarIcon,
            })}
            {RouterRow({
              pageName: "카풀 명단 조회",
              pageURL: "/carpooling-list",
              icon: ListIcon,
            })}
            {RouterRow({
              pageName: "방배정 관리",
              pageURL: "/room-assignment",
              icon: BedtimeIcon,
            })}
            {RouterRow({
              pageName: "조배정 관리",
              pageURL: "/group-formation",
              icon: GroupsIcon,
            })}
            {RouterRow({
              pageName: "권한 관리",
              pageURL: "/permission-manage",
              icon: LockIcon,
            })}
            {RouterRow({
              pageName: "입금 확인 처리",
              pageURL: "/deposit-check",
              icon: AttachMoneyIcon,
            })}
            {RouterRow({
              pageName: "접수 내용 수정",
              pageURL: "/edit-user-data",
              icon: EditIcon,
            })}
            {RouterRow({
              pageName: "인원 확인 처리",
              pageURL: "/check-status",
              icon: QrCode2Icon,
            })}
            {RouterRow({
              pageName: "인원 관리",
              pageURL: "/show-status-table",
              icon: TableChartIcon,
            })}
            {RouterRow({
              pageName: "인원 출입 관리",
              pageURL: "/inout-info",
              icon: LoginIcon,
            })}
          </List>
        </Box>
      </Drawer>
    </Stack>
  )
}

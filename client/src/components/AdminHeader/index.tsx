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
  Paper,
  Stack,
} from "@mui/material"
import { useEffect, useState } from "react"
import MenuIcon from "@mui/icons-material/Menu"
import { useRouter } from "next/navigation"

import CommunitysIcon from "@mui/icons-material/Groups"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"
import EventIcon from "@mui/icons-material/Event"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import BusinessIcon from "@mui/icons-material/Business"
import useUserData from "@/hooks/useUserData"

export default function AdminHeader() {
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

  function goToEventVote(){
      push("/admin/event/vote")
  }

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
      <Drawer open={isOpen} onClose={() => toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={goToEditAllSoonList}>
                <ListItemIcon>
                  <CommunitysIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"순 관리"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={goToDarakCommunityManagement}>
                <ListItemIcon>
                  <BusinessIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"다락방 그룹 관리"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={goToDarakPeopleManagement}>
                <ListItemIcon>
                  <PeopleOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"다락방 인원 관리"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={goToWorshipSchedule}>
                <ListItemIcon>
                  <EventIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"예배 관리"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={goToWorshipAttendance}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"출석 관리"} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={goToEventVote}>
                <ListItemIcon>
                  <EventIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={"투표 시스템"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Stack>
  )
}

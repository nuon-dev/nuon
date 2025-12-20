"use client"

import {
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Divider,
  Container,
} from "@mui/material"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import axios from "@/config/axios"
import { useEffect, useState } from "react"
import AddUser from "./AddUser"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PeopleIcon from "@mui/icons-material/People"
import PhoneIcon from "@mui/icons-material/Phone"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import { useRouter } from "next/navigation"
import RequestKakaoLogin from "@/app/leader/management/RequestKakaoLogin"

export default function SoonManagement() {
  const { push } = useRouter()
  const [groupName, setGroupName] = useState("")
  const [soonList, setSoonList] = useState<User[]>([])
  const [openAddUser, setOpenAddUser] = useState(false)
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    fetchGroupDate()
  }, [])

  async function fetchGroupDate() {
    try {
      const { data } = await axios.get<Community & { error: string }>(
        "/soon/my-group-info"
      )
      setGroupName(data.name)
      setSoonList(data.users)
    } catch (error: any) {
      console.error("Error fetching group data:", error)
      setNotificationMessage("순장만 이용할 수 있습니다.")
      push("/")
      return
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* 그룹 헤더 */}
          <Card
            elevation={2}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {groupName} 다락방
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                총 {soonList.length}명의 순원이 있습니다
              </Typography>
            </CardContent>
          </Card>

          {/* 순원 추가 버튼 */}
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddUser(true)}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 105, 135, .4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            순원 추가
          </Button>

          {/* 순원 목록 */}
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              순원 목록
            </Typography>
            {soonList.length === 0 ? (
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    아직 등록된 순원이 없습니다
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              soonList.map((user, index) => (
                <Card
                  key={user.id}
                  elevation={1}
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      elevation: 3,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor:
                            user.gender === "man" ? "#2196f3" : "#e91e63",
                          width: 56,
                          height: 56,
                          fontSize: "1.5rem",
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>

                      <Stack flex={1} spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Chip
                            label={user.gender === "man" ? "남" : "여"}
                            size="small"
                            color={
                              user.gender === "man" ? "primary" : "secondary"
                            }
                            sx={{ fontWeight: "bold" }}
                          />
                          <Chip
                            label={`${user.yearOfBirth}년생`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {user.phone}
                          </Typography>
                        </Stack>

                        <Chip
                          label={
                            user.kakaoId
                              ? "카카오 로그인 사용자"
                              : "임시 등록 사용자"
                          }
                          size="small"
                          color={user.kakaoId ? "success" : "warning"}
                          variant="outlined"
                          sx={{ alignSelf: "flex-start", fontSize: "0.75rem" }}
                        />
                      </Stack>
                    </Stack>
                    {!user.kakaoId && (
                      <Stack mt="12px">
                        <RequestKakaoLogin userId={user.id} />
                      </Stack>
                    )}
                  </CardContent>
                  {index < soonList.length - 1 && <Divider />}
                </Card>
              ))
            )}
          </Stack>

          {openAddUser && (
            <AddUser
              onClose={() => {
                setOpenAddUser(false)
                fetchGroupDate()
              }}
            />
          )}
        </Stack>
      </Container>
    </Box>
  )
}

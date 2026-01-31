"use client"

import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  TextField,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material"
import { useEffect, useState } from "react"
import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import CloseIcon from "@mui/icons-material/Close"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

interface User {
  id: string
  name: string
  yearOfBirth: number | null
  gender: string | null
}

interface Newcomer {
  id: string
  name: string
  yearOfBirth: number | null
}

interface NewcomerManager {
  id: string
  user: User
  newcomers: Newcomer[]
}

export default function ManagerPage() {
  const { isLeaderIfNotExit } = useAuth()
  const [userList, setUserList] = useState<User[]>([])
  const [managerList, setManagerList] = useState<NewcomerManager[]>([])
  const [searchName, setSearchName] = useState("")
  const [loading, setLoading] = useState(true)
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    isLeaderIfNotExit("/leader/newcomer/managers")
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [usersRes, managersRes] = await Promise.all([
        axios.get<User[]>("/newcomer/users"),
        axios.get<NewcomerManager[]>("/newcomer/managers"),
      ])
      setUserList(usersRes.data)
      setManagerList(managersRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addManager(userId: string) {
    try {
      await axios.post("/newcomer/managers", { userId })
      setNotificationMessage("담당자로 지정되었습니다.")
      await fetchData()
    } catch (error) {
      console.error("Error adding manager:", error)
      setNotificationMessage("담당자 지정 중 오류가 발생했습니다.")
    }
  }

  async function removeManager(managerId: string) {
    if (!confirm("정말로 담당자를 해제하시겠습니까?")) return
    try {
      await axios.delete(`/newcomer/managers/${managerId}`)
      setNotificationMessage("담당자가 해제되었습니다.")
      await fetchData()
    } catch (error) {
      console.error("Error removing manager:", error)
      setNotificationMessage("담당자 해제 중 오류가 발생했습니다.")
    }
  }

  function isManager(userId: string) {
    return managerList.some((manager) => manager.user.id === userId)
  }

  const filteredUsers = userList.filter((user) =>
    user.name.toLowerCase().includes(searchName.toLowerCase()),
  )

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 2 }}>
        <Typography>로딩 중...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box p={2}>
        {/* 헤더 */}
        <Typography variant="h5" fontWeight="bold" mb={2}>
          담당자 관리
        </Typography>

        <Stack direction="row" gap={2}>
          {/* 왼쪽: 사용자 목록 */}
          <Paper
            elevation={1}
            sx={{
              width: 320,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              maxHeight: "calc(100vh - 150px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              사용자 목록
            </Typography>
            <TextField
              size="small"
              placeholder="이름 검색..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {filteredUsers.map((user) => (
                <Stack
                  key={user.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isManager(user.id) ? "#f0f0f0" : "white",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: isManager(user.id) ? "#999" : "inherit",
                    }}
                  >
                    {user.name} ({user.yearOfBirth || "-"})
                  </Typography>
                  {isManager(user.id) ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "#999", fontSize: "0.7rem" }}
                    >
                      이미 담당자
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAddIcon sx={{ fontSize: 14 }} />}
                      onClick={() => addManager(user.id)}
                      sx={{
                        fontSize: "0.7rem",
                        py: 0.5,
                        px: 1,
                        minWidth: "auto",
                      }}
                    >
                      담당자 지정
                    </Button>
                  )}
                </Stack>
              ))}
              {filteredUsers.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  검색 결과가 없습니다.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* 오른쪽: 담당자 박스들 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "flex-start",
              alignContent: "flex-start",
            }}
          >
            {managerList.map((manager) => (
              <Paper
                key={manager.id}
                elevation={1}
                sx={{
                  width: 220,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  borderLeft: "4px solid #42C7F1",
                }}
              >
                {/* 담당자 헤더 */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {manager.user.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeManager(manager.id)}
                    sx={{ color: "#d32f2f" }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>

                {/* 담당 새신자 목록 */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mb={1}
                  display="block"
                >
                  담당 새신자 ({manager.newcomers?.length || 0}명)
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {manager.newcomers?.map((newcomer) => (
                    <Tooltip
                      key={newcomer.id}
                      title={`${newcomer.name} (${newcomer.yearOfBirth || "-"})`}
                      arrow
                    >
                      <Card
                        elevation={1}
                        sx={{
                          width: 60,
                          height: 50,
                          border: "1px solid #e0e0e0",
                          cursor: "default",
                        }}
                      >
                        <CardContent
                          sx={{ p: "4px !important", textAlign: "center" }}
                        >
                          <Avatar
                            sx={{
                              width: 18,
                              height: 18,
                              fontSize: "0.55rem",
                              bgcolor: "#42C7F1",
                              mx: "auto",
                              mb: 0.5,
                            }}
                          >
                            {newcomer.name.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.6rem",
                              lineHeight: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {newcomer.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Tooltip>
                  ))}
                  {(!manager.newcomers || manager.newcomers.length === 0) && (
                    <Typography variant="caption" color="text.secondary">
                      담당 새신자 없음
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}

            {/* 빈 상태 */}
            {managerList.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  width: 220,
                  p: 3,
                  borderRadius: 2,
                  border: "2px dashed #ccc",
                  textAlign: "center",
                }}
              >
                <PersonAddIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  담당자를 추가해주세요
                </Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

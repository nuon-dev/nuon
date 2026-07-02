"use client"

import axios from "@/config/axios"
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { PermissionType, permissionTypeToString } from "@server/entity/types"
import { User } from "@server/entity/user"
import { useEffect, useMemo, useState } from "react"

export default function PermissionManage() {
  const [userList, setUserList] = useState([] as Array<User>)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "editor">("list")

  const filteredUserList = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase()
    if (!trimmed) {
      return userList
    }

    return userList.filter((user) => {
      return (
        user.name.toLowerCase().includes(trimmed) ||
        String(user.yearOfBirth).includes(trimmed)
      )
    })
  }, [searchTerm, userList])

  useEffect(() => {
    loadUserList()
  }, [])

  async function loadUserList() {
    const { data } = await axios.get<User[]>("/admin/permission/get-all-user")
    data.sort((a, b) => a.name.localeCompare(b.name))
    data.sort((a, b) => b.permissions.length - a.permissions.length)
    setUserList(data)
    const selectedUserId = selectedUser?.id
    if (selectedUserId) {
      const newSelectedUser = data.find((user) => user.id === selectedUserId)
      setSelectedUser(newSelectedUser || null)
    }
  }

  async function setPermission(userId: string, permissionType: PermissionType) {
    await axios.post("/admin/permission/set-user-permission", {
      userId,
      permissionType,
    })
    loadUserList()
  }

  async function removePermission(
    userId: string,
    permissionType: PermissionType,
  ) {
    await axios.delete("/admin/permission/delete-user-permission", {
      data: {
        userId,
        permissionType,
      },
    })
    loadUserList()
  }

  return (
    <Stack
      width="100%"
      minHeight="100vh"
      maxWidth="100vw"
      py={{ xs: 3, md: 5 }}
      alignItems="center"
      sx={{
        position: "relative",
        overflowX: "hidden",
        maxWidth: "100vw",
        backgroundColor: "#f3f7fb",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(700px circle at 8% -5%, rgba(252, 233, 215, 0.45), transparent 55%), radial-gradient(900px circle at 100% 0%, rgba(215, 239, 233, 0.35), transparent 50%)",
        },
      }}
    >
      <Stack
        width="90%"
        maxWidth="1120px"
        spacing={3}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.5 },
            border: "1px solid #d8e2ea",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(249,252,255,0.92) 100%)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#10212f",
                  fontSize: { xs: "1.35rem", sm: "1.6rem" },
                }}
              >
                권한 관리 대시보드
              </Typography>
            </Stack>
            <Chip
              label={`전체 사용자 ${userList.length}명`}
              sx={{
                background: "#112a3f",
                color: "#f4f8fb",
                fontWeight: 700,
                height: 30,
              }}
            />
          </Stack>
        </Paper>

        <Stack
          width="100%"
          direction={{ xs: "column", lg: "row" }}
          spacing={2.5}
          sx={{ minWidth: 0 }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "flex", lg: "none" } }}
          >
            <Button
              variant={mobileView === "list" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setMobileView("list")}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              사용자 목록
            </Button>
            <Button
              variant={mobileView === "editor" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setMobileView("editor")}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              권한 편집
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid #d8e2ea",
              overflow: "hidden",
              minWidth: 0,
              display: {
                xs: mobileView === "list" ? "block" : "none",
                lg: "block",
              },
            }}
          >
            <Stack px={2.2} py={1.8} sx={{ background: "#f4f8fb" }}>
              <Typography sx={{ fontWeight: 700, color: "#193549" }}>
                사용자 목록
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#6a7f90" }}>
                이름을 선택하면 권한 편집 패널이 활성화됩니다.
              </Typography>
              <TextField
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                size="small"
                placeholder="이름 또는 출생연도 검색"
                sx={{ mt: 1.2, background: "#ffffff", borderRadius: 1.5 }}
              />
            </Stack>
            <Divider />
            <Stack
              px={1.2}
              py={1.2}
              spacing={0.8}
              sx={{
                maxHeight: { xs: "52vh", lg: "68vh" },
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {filteredUserList.map((user) => {
                const isSelected = selectedUser?.id === user.id

                return (
                  <Stack
                    key={user.id}
                    direction="row"
                    onClick={() => {
                      setSelectedUser(user)
                      setMobileView("editor")
                    }}
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                      px: 1.2,
                      py: 1,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid #1f6c7a"
                        : "1px solid transparent",
                      background: isSelected
                        ? "linear-gradient(120deg, #e8f5f4 0%, #f0f8ff 100%)"
                        : "transparent",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        background: isSelected
                          ? "linear-gradient(120deg, #e1f0ef 0%, #e8f3fb 100%)"
                          : "#f7fafd",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        bgcolor: isSelected ? "#1f6c7a" : "#ccd7e2",
                        color: isSelected ? "#ffffff" : "#2a3c4a",
                      }}
                    >
                      {user.name.slice(0, 1)}
                    </Avatar>
                    <Stack flex={1} minWidth={0}>
                      <Typography
                        noWrap
                        sx={{ fontWeight: 700, color: "#173145" }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{ fontSize: "0.82rem", color: "#607586" }}
                      >
                        {user.yearOfBirth}년생
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={`${user.permissions.length}개`}
                      sx={{
                        flexShrink: 0,
                        fontWeight: 700,
                        background: isSelected ? "#1f6c7a" : "#e7edf3",
                        color: isSelected ? "#ecf7fa" : "#415969",
                      }}
                    />
                  </Stack>
                )
              })}
              {filteredUserList.length === 0 && (
                <Box
                  sx={{
                    px: 2,
                    py: 4,
                    textAlign: "center",
                    color: "#6a7f90",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    검색 결과가 없습니다.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid #d8e2ea",
              px: { xs: 1.5, md: 2.3 },
              py: { xs: 1.6, md: 2.1 },
              background: "linear-gradient(165deg, #ffffff 0%, #f8fbfd 100%)",
              minWidth: 0,
              overflowX: "hidden",
              display: {
                xs: mobileView === "editor" ? "block" : "none",
                lg: "block",
              },
            }}
          >
            <Stack spacing={1.8}>
              <Button
                variant="text"
                onClick={() => setMobileView("list")}
                sx={{
                  display: { xs: "inline-flex", lg: "none" },
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 0.5,
                  minWidth: 0,
                }}
              >
                목록으로 돌아가기
              </Button>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                flexWrap="wrap"
              >
                <Stack>
                  <Typography sx={{ fontWeight: 700, color: "#193549" }}>
                    권한 편집
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#6a7f90" }}>
                    선택한 사용자의 권한을 토글하세요.
                  </Typography>
                </Stack>
                {selectedUser && (
                  <Chip
                    label={selectedUser.name}
                    sx={{
                      background: "#e8f2f9",
                      color: "#1f4662",
                      fontWeight: 700,
                      maxWidth: "100%",
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                )}
              </Stack>

              {!selectedUser ? (
                <Box
                  sx={{
                    border: "1px dashed #c2d0db",
                    borderRadius: 2,
                    px: 2,
                    py: 5,
                    textAlign: "center",
                    color: "#6c8191",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    왼쪽에서 사용자를 선택해 주세요.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {Object.values(PermissionType).map((permissionType) => {
                    const hasPermission = selectedUser.permissions.some(
                      (permission) =>
                        permission.permissionType === permissionType,
                    )

                    return (
                      <Stack
                        key={permissionType}
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{
                          px: 1.5,
                          py: 1.2,
                          borderRadius: 2,
                          border: "1px solid #dee6ee",
                          background: hasPermission ? "#f1faf7" : "#f8fafc",
                        }}
                      >
                        <Stack minWidth={0}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#1c3549",
                              wordBreak: "keep-all",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {permissionTypeToString(permissionType)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              color: "#6f8291",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {permissionType}
                          </Typography>
                        </Stack>

                        {hasPermission ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              removePermission(selectedUser.id, permissionType)
                            }
                            sx={{
                              width: { xs: "100%", sm: "auto" },
                              minWidth: { xs: 0, sm: 116 },
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            권한 제거
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() =>
                              setPermission(selectedUser.id, permissionType)
                            }
                            sx={{
                              width: { xs: "100%", sm: "auto" },
                              minWidth: { xs: 0, sm: 116 },
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              boxShadow: "none",
                              background:
                                "linear-gradient(120deg, #1f6c7a 0%, #2e8da0 100%)",
                              "&:hover": {
                                boxShadow: "none",
                                background:
                                  "linear-gradient(120deg, #1a5f6c 0%, #287f90 100%)",
                              },
                            }}
                          >
                            권한 추가
                          </Button>
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  )
}

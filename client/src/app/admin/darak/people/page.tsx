"use client"

import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Typography,
  Paper,
  Chip,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Tooltip,
} from "@mui/material"
import { get, put } from "@/config/api"
import { type User } from "@server/entity/user"
import { Community } from "@server/entity/community"
import { MouseEvent, useEffect, useRef, useState } from "react"

export default function People() {
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [noCommunityUser, setNoCommunityUser] = useState<User[]>([])
  const [selectedRootCommunity, setSelectedRootCommunity] =
    useState<Community | null>(null)
  const [childCommunityList, setChildCommunityList] = useState<Community[]>([])
  const selectedUser = useRef<User | null>(null)

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchData()
    addEventListener("mousemove", mousemoveListener)
    return () => removeEventListener("mousemove", mousemoveListener)
  }, [])

  useEffect(() => {
    if (selectedRootCommunity) {
      fetchCommunityUserList(selectedRootCommunity.id)
    } else {
      fetchCommunityUserList(0)
    }
  }, [selectedRootCommunity])

  function mousemoveListener(e: any) {
    if (!selectedUser.current) {
      return
    }
    const event = e as MouseEvent
    setMousePosition({ x: event.pageX, y: event.pageY })
  }

  async function fetchCommunityUserList(communityId: number) {
    const communityUserListData = await get(
      `/admin/community/user-list/${communityId}`
    )
    setChildCommunityList(communityUserListData)
  }

  async function fetchData() {
    const communityListData = await get("/admin/community")
    setCommunityList(communityListData)
    const noCommunityUserData = await get(
      "/admin/community/no-community-user-list"
    )
    setNoCommunityUser(noCommunityUserData)

    // 전체 사용자 수 계산 (모든 커뮤니티의 사용자 + 미배정 사용자)
    const calculateTotalUsers = (communities: Community[]): number => {
      return communities.reduce((total, community) => {
        const communityUsers = community.users?.length || 0
        const childUsers = community.children
          ? calculateTotalUsers(community.children)
          : 0
        return total + communityUsers + childUsers
      }, 0)
    }
  }

  function communityFilter(targetCommunity: Community) {
    if (!selectedRootCommunity) {
      return !targetCommunity.parent
    }
    return targetCommunity.parent?.id === selectedRootCommunity.id
  }

  async function removeCommunityToUser() {
    if (!selectedUser.current) return
    selectedUser.current.community = null
    await saveUser(selectedUser.current)
    selectedUser.current = null
    await fetchCommunityUserList(selectedRootCommunity?.id || 0)
    await fetchData()
  }

  async function setUser(e: MouseEvent, targetCommunity: Community) {
    if (!selectedUser.current) return
    e.stopPropagation()
    if (
      selectedUser.current.community &&
      selectedUser.current.community.id === targetCommunity.id
    ) {
      selectedUser.current = null
      return
    }
    selectedUser.current.community = targetCommunity
    await saveUser(selectedUser.current)
    selectedUser.current = null
    await fetchCommunityUserList(selectedRootCommunity?.id || 0)
    await fetchData()
  }

  async function saveUser(user: User) {
    await put("/admin/soon/update-user", user)
  }

  async function saveCommunityLeader(
    community: Community,
    leaderId: number | null
  ) {
    await put("/admin/community/save-leader", {
      groupId: community.id,
      leaderId,
    })
    await fetchData()
  }

  async function saveCommunityDeputyLeader(
    community: Community,
    deputyLeaderId: number | null
  ) {
    await put("/admin/community/save-deputy-leader", {
      groupId: community.id,
      deputyLeaderId,
    })
    await fetchData()
  }

  function selectUser(e: MouseEvent, user: User) {
    e.stopPropagation()
    const target = e.target as HTMLElement
    const shiftX = e.clientX - target.getBoundingClientRect().left
    const shiftY = e.clientY - target.getBoundingClientRect().top
    setShiftPosition({ x: shiftX, y: shiftY })
    selectedUser.current = user
  }

  function UserBox({ user }: { user: User }) {
    return (
      <Tooltip title={`${user.name} (${user.yearOfBirth}년생)`} arrow>
        <Card
          elevation={1}
          sx={{
            width: 68,
            height: 54,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              elevation: 3,
              transform: "scale(1.05)",
              borderColor: "primary.main",
              bgcolor: "primary.50",
            },
          }}
          key={user.id}
          onMouseDown={(e) => selectUser(e, user)}
          onClick={(e) => selectUser(e, user)}
        >
          <CardContent sx={{ p: "4px !important", textAlign: "center" }}>
            <Avatar
              sx={{
                width: 20,
                height: 20,
                fontSize: "0.6rem",
                bgcolor: "primary.main",
                mx: "auto",
                mb: 0.5,
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              display="block"
              sx={{
                fontSize: "0.65rem",
                lineHeight: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name} <br />({user.yearOfBirth})
            </Typography>
          </CardContent>
        </Card>
      </Tooltip>
    )
  }

  function CommunityBox({ displayCommunity }: { displayCommunity: Community }) {
    const myCommunity = childCommunityList.find(
      (community) => community.id === displayCommunity.id
    )

    function onClickCommunity(e: MouseEvent) {
      e.stopPropagation()
      setSelectedRootCommunity(displayCommunity)
    }

    if (!myCommunity) {
      return (
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            minWidth: 180,
            maxWidth: 220,
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color="text.secondary"
            mb={1}
          >
            {displayCommunity.name}
          </Typography>
          <Stack gap={1}>
            {displayCommunity.children?.map((child) => (
              <CommunityBox
                displayCommunity={child}
                key={`${displayCommunity.id}_${child.id}`}
              />
            ))}
          </Stack>
        </Paper>
      )
    }

    const leaderList = [
      ...myCommunity.users,
      ...myCommunity.children.map((child) => child.leader).filter(Boolean),
    ]

    return (
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "primary.light",
          minWidth: 200,
          maxWidth: 280,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "primary.main",
            elevation: 3,
          },
        }}
        onMouseUp={(e) => setUser(e, displayCommunity)}
      >
        <Box
          onClick={onClickCommunity}
          sx={{
            cursor: "pointer",
            mb: 1,
            p: 0.5,
            borderRadius: 1,
            bgcolor: "primary.50",
            "&:hover": {
              bgcolor: "primary.100",
            },
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="primary.main"
          >
            {displayCommunity.name}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} mb={1}>
          <FormControl
            size="small"
            sx={{ minWidth: 50, flex: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <InputLabel sx={{ fontSize: "0.75rem" }}>순장</InputLabel>
            <Select
              value={displayCommunity.leader?.id || 0}
              label="순장"
              sx={{ fontSize: "0.75rem", height: "32px" }}
              onChange={(e) => {
                saveCommunityLeader(displayCommunity, e.target.value as number)
              }}
            >
              <MenuItem value={0} sx={{ fontSize: "0.75rem" }}>
                없음
              </MenuItem>
              {leaderList.map((user) => (
                <MenuItem
                  key={user?.id}
                  value={user?.id}
                  sx={{ fontSize: "0.75rem" }}
                >
                  {user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 50, flex: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <InputLabel sx={{ fontSize: "0.75rem" }}>부순장</InputLabel>
            <Select
              value={displayCommunity.deputyLeader?.id || 0}
              label="부순장"
              sx={{ fontSize: "0.75rem", height: "32px" }}
              onChange={(e) => {
                saveCommunityDeputyLeader(
                  displayCommunity,
                  e.target.value as number
                )
              }}
            >
              <MenuItem value={0} sx={{ fontSize: "0.75rem" }}>
                없음
              </MenuItem>
              {leaderList.map((user) => (
                <MenuItem
                  key={user?.id}
                  value={user?.id}
                  sx={{ fontSize: "0.75rem" }}
                >
                  {user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            mb={0.5}
            display="block"
          >
            구성원 {myCommunity.users.length}명
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {myCommunity.users.map((user) => (
              <UserBox key={user.id} user={user} />
            ))}
          </Box>
        </Box>

        {displayCommunity.children && displayCommunity.children.length > 0 && (
          <Box mt={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={0.5}
              display="block"
            >
              하위 그룹
            </Typography>
            <Stack gap={0.5}>
              {displayCommunity.children.map((child) => (
                <CommunityBox
                  displayCommunity={child}
                  key={`${displayCommunity.id}_${child.id}`}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    )
  }

  function getParentCommunityName(community: Community | null): string {
    if (!community) {
      return "최상위"
    }
    if (!community.parent) {
      return community.name
    }
    return `${getParentCommunityName(community.parent)} > ${community.name}`
  }

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>
      <Box p={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            커뮤니티 관리
          </Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Chip
              label={`미배정: ${noCommunityUser.length}명`}
              size="small"
              variant="outlined"
              color={noCommunityUser.length > 0 ? "warning" : "success"}
            />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          gap={2}
          onMouseUp={() => {
            selectedUser.current = null
          }}
        >
          {/* 미배정 사용자 영역 */}
          <Paper
            elevation={2}
            sx={{
              width: 320,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "2px dashed",
              borderColor: "warning.light",
              maxHeight: "calc(100vh - 200px)",
              overflow: "hidden",
            }}
            onMouseUp={removeCommunityToUser}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={1}
              color="warning.main"
            >
              미배정 사용자 ({noCommunityUser.length}명)
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={2}
              display="block"
            >
              다락방에 속하지 않은 사용자들입니다.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                maxHeight: "calc(100vh - 300px)",
                overflowY: "auto",
                pr: 1,
              }}
            >
              {noCommunityUser.map((user) => UserBox({ user }))}
            </Box>
          </Paper>

          {/* 커뮤니티 영역 */}
          <Box
            flex="1"
            sx={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}
          >
            {/* 네비게이션 */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
                    현재 위치
                  </Typography>
                  <Breadcrumbs>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ fontWeight: "medium" }}
                    >
                      {getParentCommunityName(selectedRootCommunity)}
                    </Typography>
                  </Breadcrumbs>
                </Box>
                <Stack direction="row" gap={1}>
                  <Button
                    onClick={() => setSelectedRootCommunity(null)}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    최상위로
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={() =>
                      setSelectedRootCommunity(
                        selectedRootCommunity
                          ? selectedRootCommunity.parent
                          : null
                      )
                    }
                  >
                    상위로
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* 커뮤니티 목록 */}
            {communityList.filter(communityFilter).length === 0 ? (
              <Paper
                elevation={1}
                sx={{ p: 4, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="h6" color="text.secondary">
                  하위 그룹이 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  이 레벨에서는 관리할 하위 그룹이 존재하지 않습니다.
                </Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                {communityList.filter(communityFilter).map((community) => (
                  <CommunityBox
                    displayCommunity={community}
                    key={community.id}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Stack>

        {/* 드래그 중인 사용자 표시 */}
        {selectedUser.current && selectedUser.current.id && (
          <Box
            position="absolute"
            top={mousePosition.y - shiftPosition.y}
            left={mousePosition.x - shiftPosition.x}
            sx={{
              pointerEvents: "none",
              zIndex: 1000,
              opacity: 0.8,
              transform: "rotate(-5deg) scale(1.1)",
            }}
          >
            {UserBox({ user: selectedUser.current })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

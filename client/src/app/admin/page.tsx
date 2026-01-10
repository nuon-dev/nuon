"use client"

import {
  Stack,
  Card,
  Box,
  Chip,
  List,
  Alert,
  Divider,
  ListItem,
  Typography,
  CardContent,
  LinearProgress,
  CircularProgress,
} from "@mui/material"
import { useSetAtom } from "jotai"
import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import { NotificationMessage } from "@/state/notification"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"

interface DashboardData {
  totalUsers: number
  totalCommunities: number
  statistics: {
    weekly: {
      attendCount: number
      absentCount: number
      etcCount: number
      attendPercent: number
      genderRatio: { male: number; female: number }
      newFamilyPercent: number
    }
    monthly: {
      attendCount: number
      absentCount: number
      etcCount: number
      attendPercent: number
      genderRatio: { male: number; female: number }
      newFamilyPercent: number
    }
  }
  communityStats: Array<{
    communityName: string
    parentName: string
    attendCount: number
    totalMembers: number
    attendanceRate: number
  }>
  recentAbsentees: Array<{
    name: string
    yearOfBirth: number
    gender: string
    community: string
    date: string
    memo: string
  }>
  lastUpdated: string
}

function index() {
  const router = useRouter()
  const { isLogin, authUserData } = useAuth()
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    hasPermission()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchDashboardData()
    }
  }, [loading])

  async function hasPermission() {
    if (!isLogin || !authUserData) {
      router.push("/common/login?returnUrl=/admin")
    } else if (!authUserData.role.Admin) {
      setNotificationMessage("관리자 권한이 없습니다.")
      router.push("/")
    } else {
      setLoading(false)
    }
  }

  async function fetchDashboardData() {
    try {
      const { data } = await axios.get("/admin/dashboard")
      setDashboardData(data)
    } catch (err) {
      setError("대시보드 데이터를 불러오는 중 오류가 발생했습니다.")
      console.error("Dashboard fetch error:", err)
    }
  }

  if (loading) {
    return (
      <Stack
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <Stack alignItems="center" justifyContent="center" flex={1}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            대시보드를 불러오는 중...
          </Typography>
        </Stack>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <Stack alignItems="center" justifyContent="center" flex={1} p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Stack>
      </Stack>
    )
  }

  if (!dashboardData) {
    return (
      <Stack
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <Stack alignItems="center" justifyContent="center" flex={1}>
          <Typography variant="h6">데이터를 불러올 수 없습니다.</Typography>
        </Stack>
      </Stack>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          관리자 대시보드
        </Typography>

        {/* 기본 통계 카드들 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ mb: 4 }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PeopleIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                <Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    등록된 인원
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EventNoteIcon sx={{ fontSize: 40, color: "#388e3c" }} />
                <Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.totalCommunities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    다락방 + 마을 수
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CalendarTodayIcon sx={{ fontSize: 40, color: "#f57c00" }} />
                <Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.statistics.weekly.attendPercent}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    이번 주 출석률
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUpIcon sx={{ fontSize: 40, color: "#7b1fa2" }} />
                <Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.statistics.weekly.newFamilyPercent}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    새가족 비율
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          {/* 주간/월간 통계 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                출석 통계
              </Typography>

              <Stack spacing={3}>
                {/* 이번 주 통계 */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                  >
                    이번 주
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                  >
                    <Chip
                      label={`출석 ${dashboardData.statistics.weekly.attendCount}명`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`결석 ${dashboardData.statistics.weekly.absentCount}명`}
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`기타 ${dashboardData.statistics.weekly.etcCount}명`}
                      color="warning"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Chip
                      label={`남성 ${dashboardData.statistics.weekly.genderRatio.male}%`}
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`여성 ${dashboardData.statistics.weekly.genderRatio.female}%`}
                      color="secondary"
                      size="small"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* 이번 달 통계 */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="secondary"
                  >
                    이번 달
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                  >
                    <Chip
                      label={`출석 ${dashboardData.statistics.monthly.attendCount}명`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`결석 ${dashboardData.statistics.monthly.absentCount}명`}
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`기타 ${dashboardData.statistics.monthly.etcCount}명`}
                      color="warning"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    출석률: {dashboardData.statistics.monthly.attendPercent}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 다락방별 출석 현황 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                다락방별 출석 현황 (이번 주)
              </Typography>
              <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
                {dashboardData.communityStats.map((community, index) => (
                  <ListItem key={index} divider>
                    <Box sx={{ width: "100%" }}>
                      {/* 첫 번째 줄: 다락방 이름과 출석 인원 */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ flex: 1, pr: 1 }}
                        >
                          {community.communityName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minWidth: "70px", textAlign: "right" }}
                        >
                          {community.attendCount}/{community.totalMembers}명
                        </Typography>
                      </Box>

                      {/* 두 번째 줄: 부모 커뮤니티와 출석률, 진행률 바 */}
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {community.parentName}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {community.attendanceRate}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={community.attendanceRate}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>

        {/* 최근 3주간 결석자 */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              최근 3주간 결석자 현황
            </Typography>
            <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
              {dashboardData.recentAbsentees
                .slice(0, 20)
                .map((absentee, index) => (
                  <ListItem key={index} divider>
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="subtitle2">
                          {absentee.name} ({absentee.yearOfBirth}년생)
                        </Typography>
                        <Chip
                          label={absentee.gender === "man" ? "남" : "여"}
                          size="small"
                          color={
                            absentee.gender === "man" ? "primary" : "secondary"
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {absentee.date}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {absentee.community}
                        </Typography>
                        {absentee.memo && (
                          <Typography
                            variant="caption"
                            sx={{ fontStyle: "italic" }}
                          >
                            사유: {absentee.memo}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                ))}
            </List>
            {dashboardData.recentAbsentees.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ py: 3 }}
              >
                최근 3주간 결석자가 없습니다.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 마지막 업데이트 시간 */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            마지막 업데이트:{" "}
            {new Date(dashboardData.lastUpdated).toLocaleString("ko-KR")}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default index

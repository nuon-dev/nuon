"use client"

import { Box, Stack, Typography } from "@mui/material"
import { get } from "../../../config/api"
import { useEffect, useState } from "react"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import Header from "@/components/retreat/admin/Header"
import StatCard from "@/app/retreat/admin/dash-board/StatCard"
import BarChart from "@/app/retreat/admin/dash-board/BarChart"
import PeopleIcon from "@mui/icons-material/People"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import MaleIcon from "@mui/icons-material/Male"
import FemaleIcon from "@mui/icons-material/Female"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import PaymentIcon from "@mui/icons-material/Payment"
import useAuth from "@/hooks/useAuth"

//아이콘 주소 https://www.flaticon.com/kr/
export default function Admin() {
  const { ifNotLoggedGoToLogin } = useAuth()
  const [attendeeStatus, setAttendeeStatus] = useState(
    {} as Record<string, number>,
  )
  const [attendanceTimeList, setAttendanceTimeList] = useState([])
  const [ageInfoList, setAgeInfoList] = useState<Record<string, number>>({})
  const [infoList, setInfoList] = useState<InOutInfo[]>([])

  useEffect(() => {
    ifNotLoggedGoToLogin("/retreat/admin")
    fetchData()
    const interval = setInterval(fetchData, 1000 * 60 * 30)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [status, timeList, ageInfo, info] = await Promise.all([
        get("/retreat/admin/get-attendee-status"),
        get("/retreat/admin/get-attendance-time"),
        get("/retreat/admin/get-age-info"),
        get("/retreat/admin/in-out-info"),
      ])

      setAttendeeStatus(status)
      setAttendanceTimeList(timeList)
      setAgeInfoList(ageInfo)
      setInfoList(info)
    } catch (error) {
      console.error("데이터 조회 실패:", error)
    }
  }

  // 일별 등록자 데이터 처리 - 날짜순으로 정렬
  const getDailyRegistrationData = () => {
    const timeData: Record<string, number> = {}
    attendanceTimeList.forEach((time) => {
      const date = new Date(time)
      const key = `${date.getMonth() + 1}.${date.getDate()}`
      timeData[key] = (timeData[key] || 0) + 1
    })

    // 날짜순으로 정렬
    const sortedEntries = Object.entries(timeData).sort(([a], [b]) => {
      const [monthA, dayA] = a.split(".").map(Number)
      const [monthB, dayB] = b.split(".").map(Number)

      if (monthA !== monthB) {
        return monthA - monthB
      }
      return dayA - dayB
    })

    return Object.fromEntries(sortedEntries)
  }

  const targetCount = 400
  const attendanceRate = ((attendeeStatus.all / targetCount) * 100).toFixed(1)
  const maleRate = ((attendeeStatus.man / attendeeStatus.all) * 100).toFixed(1)
  const femaleRate = (
    (attendeeStatus.woman / attendeeStatus.all) *
    100
  ).toFixed(1)
  const depositRate = (
    (attendeeStatus.completeDeposit / attendeeStatus.all) *
    100
  ).toFixed(1)

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "2000px", mx: "auto" }}>
        {/* 주요 통계 섹션 */}
        <Box mb={8}>
          <Typography
            variant="h5"
            fontWeight="700"
            mb={3}
            sx={{
              fontSize: "19px",
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              letterSpacing: "-0.3px",
            }}
          >
            <Box
              sx={{
                width: "5px",
                height: "28px",
                bgcolor: "#42C7F1",
                borderRadius: "2px",
              }}
            />
            주요 통계
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            <StatCard
              title="총 참가자"
              value={`${attendeeStatus.all || 0}`}
              subtitle={`목표: ${targetCount}명`}
              icon={<PeopleIcon />}
              backgroundColor="#E3F2FD"
            />

            <StatCard
              title="참석률"
              value={`${attendanceRate}%`}
              icon={<TrendingUpIcon />}
              backgroundColor="#E8F5E8"
            />

            <StatCard
              title="성비"
              value={`${attendeeStatus.man || 0} : ${attendeeStatus.woman || 0}`}
              subtitle={`남 ${maleRate}% / 여 ${femaleRate}%`}
              icon={
                <Box sx={{ display: "flex" }}>
                  <MaleIcon color="primary" />
                  <FemaleIcon sx={{ color: "pink" }} />
                </Box>
              }
              backgroundColor="#FFF3E0"
            />

            <StatCard
              title="입금 완료율"
              value={`${depositRate}%`}
              icon={<PaymentIcon />}
              backgroundColor="#F3E5F5"
            />
          </Box>
        </Box>

        {/* 버스 이용 현황 섹션 */}
        <Box mb={8}>
          <Typography
            variant="h5"
            fontWeight="700"
            mb={3}
            sx={{
              fontSize: "19px",
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              letterSpacing: "-0.3px",
            }}
          >
            <Box
              sx={{
                width: "5px",
                height: "28px",
                bgcolor: "#FF6B6B",
                borderRadius: "2px",
              }}
            />
            버스 이용 현황
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            <StatCard
              title="주일 수련회장 버스"
              value={`${attendeeStatus.leaveTogether || 0}명`}
              icon={<DirectionsBusIcon />}
              backgroundColor="#E1F5FE"
            />

            <StatCard
              title="목요일 교회 버스"
              value={`${attendeeStatus.goTogether || 0}명`}
              icon={<DirectionsBusIcon />}
              backgroundColor="#E8EAF6"
            />

            <StatCard
              title="금요일 교회 버스"
              value={`${attendeeStatus.rideCar || 0}명`}
              icon={<DirectionsBusIcon />}
              backgroundColor="#FDE7E7"
            />
          </Box>
        </Box>

        {/* 통계 분석 섹션 */}
        <Stack gap="12px" mb={8}>
          <Typography
            variant="h5"
            fontWeight="700"
            mb={3}
            sx={{
              fontSize: "19px",
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              letterSpacing: "-0.3px",
            }}
          >
            <Box
              sx={{
                width: "5px",
                height: "28px",
                bgcolor: "#10B981",
                borderRadius: "2px",
              }}
            />
            통계 분석
          </Typography>
          <BarChart
            title="일별 등록자 수"
            data={getDailyRegistrationData()}
            color="#3B82F6"
          />

          <BarChart
            title="나이별 등록자 수"
            data={Object.fromEntries(
              Object.entries(ageInfoList).map(([key, value]) => [
                key.slice(2, 4) + "년생",
                value,
              ]),
            )}
            color="#10B981"
          />
        </Stack>
      </Box>

      {/* 시간별 참석자 현황 
        <AttendanceTimeline
          infoList={infoList}
          attendeeStatus={attendeeStatus}
        />
        */}
    </Box>
  )
}

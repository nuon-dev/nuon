"use client"

import axios from "@/config/axios"
import { get } from "@/config/api"
import CommunityBox from "./CommunityBox"
import { User } from "@server/entity/user"
import { Stack, Box, Card, CardContent, Typography } from "@mui/material"
import { Community } from "@server/entity/community"
import { useEffect, useMemo, useState } from "react"
import { AttendData } from "@server/entity/attendData"
import { WorshipKind, WorshipSchedule } from "@server/entity/worshipSchedule"
import AttendanceTable from "./AttendanceTable"
import AttendanceFilter from "./AttendanceFilter"
import CommunityNavigation from "./CommunityNavigation"
import { sortByCommunityId, getAttendUserCount } from "./utils/attendanceUtils"

export default function AttendanceAdminPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  )
  const [communityStack, setCommunityStack] = useState<Community[]>([])
  const [soonList, setSoonList] = useState<User[]>([])
  const [attendDataList, setAttendDataList] = useState<AttendData[]>([])
  const [worshipScheduleFilter, setWorshipScheduleFilter] = useState<
    WorshipKind | "all"
  >("all")

  useEffect(() => {
    fetchCommunities()
  }, [])

  async function fetchCommunities() {
    const data = await get("/admin/community")
    setCommunities(data)
  }

  const filteredCommunities = useMemo(() => {
    if (!selectedCommunity) {
      return communities.filter((community) => !community.parent)
    }
    return communities.filter((community) => {
      return community.parent?.id === selectedCommunity.id
    })
  }, [communities, selectedCommunity])

  const leaders = useMemo(() => {
    return soonList.filter((user) => {
      return (
        user.community?.leader?.id === user.id ||
        user.community?.deputyLeader?.id === user.id
      )
    })
  }, [soonList])

  useEffect(() => {
    if (filteredCommunities.length === 0) {
      if (!selectedCommunity) {
        setSoonList([])
        setAttendDataList([])
        return
      }
      axios
        .post("/admin/soon/get-soon-list", {
          ids: selectedCommunity?.id,
        })
        .then((response) => {
          const soonListData = response.data as User[]
          soonListData.sort(sortByCommunityId)
          setSoonList(soonListData)
        })
      return
    }
    axios
      .post("/admin/soon/get-soon-list", {
        ids: filteredCommunities.map((community) => community.id).join(","),
      })
      .then((response) => {
        const soonListData = response.data as User[]
        soonListData.sort(sortByCommunityId)
        setSoonList(soonListData)
      })
  }, [filteredCommunities])

  useEffect(() => {
    if (soonList.length === 0) return
    const soonIds = soonList.map((user) => user.id)

    axios
      .post("/admin/soon/user-attendance", {
        ids: soonIds.join(","),
      })
      .then((response) => {
        setAttendDataList(response.data)
      })
  }, [soonList])

  const worshipScheduleMapList = useMemo(() => {
    const map: WorshipSchedule[] = []
    attendDataList.forEach((data) => {
      const existing = map.find(
        (worshipSchedule) => worshipSchedule.id === data.worshipSchedule.id
      )
      if (existing) {
        return
      }
      if (
        worshipScheduleFilter !== "all" &&
        data.worshipSchedule.kind !== worshipScheduleFilter
      ) {
        return
      }
      map.push(data.worshipSchedule)
    })
    return map.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [attendDataList, worshipScheduleFilter])

  function handleCommunityClick(community: Community) {
    setSelectedCommunity(community)
    setCommunityStack((prev) => {
      const newStack = [...prev, community]
      return newStack
    })
  }

  function handleBackClick() {
    setCommunityStack((prev) => {
      const newStack = [...prev]
      newStack.pop()
      return newStack
    })
    setSelectedCommunity(communityStack[communityStack.length - 2] || null)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ p: 2 }}>
        {/* 커뮤니티 네비게이션 & 필터 통합 카드 */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Stack spacing={2}>
              {/* 상단: 네비게이션과 필터 */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems="center"
              >
                <Box sx={{ flex: 1 }}>
                  <CommunityNavigation
                    communityStack={communityStack}
                    handleBackClick={handleBackClick}
                  />
                </Box>
                <Box>
                  <AttendanceFilter
                    worshipScheduleFilter={worshipScheduleFilter}
                    setWorshipScheduleFilter={setWorshipScheduleFilter}
                  />
                </Box>
              </Stack>

              {/* 하단: 다락방 선택 */}
              {filteredCommunities.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    다락방 선택
                  </Typography>
                  <Stack direction="row" gap={2} flexWrap="wrap">
                    {filteredCommunities.map((community) => (
                      <CommunityBox
                        key={community.id}
                        community={community}
                        setSelectedCommunity={handleCommunityClick}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 출석 테이블 카드 */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <AttendanceTable
              soonList={soonList}
              attendDataList={attendDataList}
              worshipScheduleMapList={worshipScheduleMapList}
              leaders={leaders}
              getAttendUserCount={getAttendUserCount}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

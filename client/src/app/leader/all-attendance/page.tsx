"use client"

import axios from "@/config/axios"
import { get } from "@/config/api"
import { User } from "@server/entity/user"
import { Stack, Box, Card, CardContent, Typography } from "@mui/material"
import { Community } from "@server/entity/community"
import { useEffect, useMemo, useState } from "react"
import { AttendData } from "@server/entity/attendData"
import { AttendStatus } from "@server/entity/types"
import { WorshipKind, WorshipSchedule } from "@server/entity/worshipSchedule"
import AttendanceTable from "@/app/admin/soon/attendance/AttendanceTable"
import AttendanceFilter from "@/app/admin/soon/attendance/AttendanceFilter"
import CommunityNavigation from "@/app/admin/soon/attendance/CommunityNavigation"
import {
  sortByCommunityId,
  getAttendUserCount,
} from "@/app/admin/soon/attendance/utils/attendanceUtils"
import CommunityBox from "@/app/admin/soon/attendance/CommunityBox"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"

export default function AttendanceAdminPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  )
  const [communityStack, setCommunityStack] = useState<Community[]>([])
  const [soonList, setSoonList] = useState<User[]>([])
  const [attendDataList, setAttendDataList] = useState<AttendData[]>([])
  const [worshipScheduleFilter, setWorshipScheduleFilter] = useState<
    WorshipKind | "all"
  >("all")

  const { authUserData } = useAuth()
  const { push } = useRouter()
  const { error } = useNotification()
  const editable = Boolean(
    authUserData?.role.Admin || authUserData?.role.VillageLeader,
  )

  useEffect(() => {
    // authUserData가 비동기로 로드되므로 준비될 때까지 판정 보류
    if (!authUserData) return
    fetchCommunities()
    if (!authUserData.role.VillageLeader) {
      error("접근 권한이 없습니다.")
      push("/leader")
    }
  }, [authUserData])

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
        (worshipSchedule) => worshipSchedule.id === data.worshipSchedule.id,
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

  async function handleSaveCell(
    userId: string,
    worshipScheduleId: number,
    status: AttendStatus,
    memo: string,
  ) {
    try {
      await axios.post("/admin/soon/update-attendance", {
        userId,
        worshipScheduleId,
        isAttend: status,
        memo,
      })

      setAttendDataList((prev) => {
        const idx = prev.findIndex(
          (d) =>
            d.user.id === userId && d.worshipSchedule.id === worshipScheduleId,
        )
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], isAttend: status, memo }
          return updated
        }
        const schedule = worshipScheduleMapList.find(
          (ws) => ws.id === worshipScheduleId,
        )
        return [
          ...prev,
          {
            user: { id: userId } as User,
            worshipSchedule: (schedule ?? {
              id: worshipScheduleId,
            }) as WorshipSchedule,
            isAttend: status,
            memo,
          } as AttendData,
        ]
      })
    } catch (e: any) {
      error("저장 실패: " + (e?.response?.data?.error || e?.message || ""))
    }
  }

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
              editable={editable}
              onSaveCell={handleSaveCell}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

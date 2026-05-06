import { useEffect, useMemo, useState } from "react"
import axios from "@/config/axios"
import { get } from "@/config/api"
import { AttendData } from "@server/entity/attendData"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import { useNotification } from "@/hooks/useNotification"
import {
  buildAttendMap,
  buildNameMap,
  buildParentMap,
} from "./utils/attendanceUtils"

// 출석 편집에 필요한 모든 데이터를 한 자리에서 로드한다.
// 3개의 useEffect가 의존성 체인으로 직렬화: communities → allUsers → attendData.
export function useAttendanceData(selectedScheduleId: number | "") {
  const { error } = useNotification()
  const [communities, setCommunities] = useState<Community[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([])
  const [attendData, setAttendData] = useState<AttendData[]>([])
  const [loading, setLoading] = useState(true)

  // mount 한 번만 로드 — useNotification의 error는 매 렌더 새 ref라
  // deps에 넣으면 무한 루프가 난다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    ;(async () => {
      try {
        const [commData, schedResp] = await Promise.all([
          get("/admin/community"),
          axios.get<WorshipSchedule[]>("/soon/worship-schedule"),
        ])
        setCommunities(commData)
        setSchedules(schedResp.data)
      } catch (e) {
        error("데이터 로드 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (communities.length === 0) return
    const topIds = communities
      .filter((c) => !c.parent)
      .map((c) => c.id)
      .join(",")
    if (!topIds) return
    axios
      .post<User[]>("/admin/soon/get-soon-list", { ids: topIds })
      .then((resp) => setAllUsers(resp.data))
  }, [communities])

  useEffect(() => {
    if (allUsers.length === 0 || !selectedScheduleId) return
    const userIds = allUsers.map((u) => u.id).join(",")
    axios
      .post<AttendData[]>("/admin/soon/user-attendance", { ids: userIds })
      .then((resp) => {
        const filtered = resp.data.filter(
          (d) => d.worshipSchedule.id === selectedScheduleId,
        )
        setAttendData(filtered)
      })
  }, [allUsers, selectedScheduleId])

  const attendMap = useMemo(() => buildAttendMap(attendData), [attendData])
  const parentMap = useMemo(() => buildParentMap(communities), [communities])
  const nameMap = useMemo(() => buildNameMap(communities), [communities])

  return {
    communities,
    allUsers,
    schedules,
    attendData,
    attendMap,
    parentMap,
    nameMap,
    loading,
    setAttendData,
  }
}

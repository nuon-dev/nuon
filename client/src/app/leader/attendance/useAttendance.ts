"use client"

import { AttendData } from "@server/entity/attendData"
import { Community } from "@server/entity/community"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import axios from "@/config/axios"
import { useEffect } from "react"
import { atom, useAtom } from "jotai"
import { AttendStatus } from "@server/entity/types"
import { useNotification } from "@/hooks/useNotification"

const groupInfoAtom = atom<Community | undefined>(undefined)
const worshipScheduleListAtom = atom<WorshipSchedule[]>([])
const selectedScheduleIdAtom = atom<number>(0)
const soonAttendDataAtom = atom<AttendData[]>([])

export default function useAttendance() {
  const [groupInfo, setGroupInfo] = useAtom(groupInfoAtom)
  const [worshipScheduleList, setWorshipScheduleList] = useAtom(
    worshipScheduleListAtom,
  )
  const [selectedScheduleId, setSelectedScheduleId] = useAtom(
    selectedScheduleIdAtom,
  )
  const [soonAttendData, setSoonAttendData] = useAtom(soonAttendDataAtom)
  const { success, error } = useNotification()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedScheduleId) {
      getAttendData(selectedScheduleId)
    }
  }, [selectedScheduleId])

  async function getAttendData(scheduleId: number) {
    const usersIds = groupInfo?.users.map((user) => user.id) || []
    const { data } = await axios.get<AttendData[]>(
      `/soon/attendance/?scheduleId=${scheduleId}`,
    )
    groupInfo?.users.forEach((user) => {
      if (
        !data.find(
          (d) => d.user.id === user.id && d.worshipSchedule.id === scheduleId,
        )
      ) {
        data.push({
          user: user,
          worshipSchedule: { id: scheduleId } as WorshipSchedule,
          isAttend: AttendStatus.ATTEND,
        } as AttendData)
      }
    })
    setSoonAttendData(data)
  }

  async function fetchData() {
    const { data: groupInfo } = await axios.get<Community>(
      "/soon/my-group-info",
    )
    setGroupInfo(groupInfo)
    const { data: worshipScheduleList } = await axios.get<WorshipSchedule[]>(
      "/soon/worship-schedule",
    )
    setWorshipScheduleList(worshipScheduleList)
    if (worshipScheduleList.length > 0) {
      setSelectedScheduleId(worshipScheduleList[0].id as number)
    }
  }

  function getLastSundayDateString(): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    let daysToSubtract = 0

    if (dayOfWeek === 0) {
      // 오늘이 일요일 → 저번주 일요일 (7일 전)
      daysToSubtract = 7
    } else {
      // 월-토 → dayOfWeek + 7일 전
      daysToSubtract = dayOfWeek + 7
    }

    const lastSunday = new Date(today)
    lastSunday.setDate(lastSunday.getDate() - daysToSubtract)

    // 로컬 시간 기준으로 YYYY-MM-DD 형식 정규화
    const year = lastSunday.getFullYear()
    const month = String(lastSunday.getMonth() + 1).padStart(2, "0")
    const date = String(lastSunday.getDate()).padStart(2, "0")

    return `${year}-${month}-${date}`
  }

  async function loadLastSundayAttendance() {
    if (!groupInfo) return

    const dateStr = getLastSundayDateString()
    console.log("지난주 일요일 날짜:", dateStr)

    // 지난주 일요일 일정 찾기
    const lastSundaySchedule = worshipScheduleList.find(
      (schedule) => schedule.date === dateStr,
    )

    console.log("지난주 일요일 일정:", lastSundaySchedule?.id)
    if (!lastSundaySchedule) {
      error("지난주 일요일 예배 일정이 없습니다.")
      return
    }

    // 지난주 일요일 출석 데이터 조회
    const { data: lastSundayAttendData } = await axios.get<AttendData[]>(
      `/soon/attendance/?scheduleId=${lastSundaySchedule.id}`,
    )

    // 현재 출석 데이터에 지난주 상태 적용 (저장 상태는 유지)
    const updatedAttendData = soonAttendData.map((attendData) => {
      const lastSundayData = lastSundayAttendData.find(
        (d) => d.user.id === attendData.user.id,
      )
      if (lastSundayData) {
        return {
          user: attendData.user,
          worshipSchedule: { id: selectedScheduleId } as WorshipSchedule,
          isAttend: lastSundayData.isAttend,
          memo: lastSundayData.memo,
        } as AttendData
      }
      return attendData
    })

    console.log("updatedAttendData", updatedAttendData)
    setSoonAttendData(updatedAttendData)
    success("지난주 일요일 출석 데이터를 불러왔습니다.")
  }

  return {
    groupInfo,
    worshipScheduleList,
    selectedScheduleId,
    setSelectedScheduleId,
    soonAttendData,
    setSoonAttendData,
    getAttendData,
    loadLastSundayAttendance,
  }
}

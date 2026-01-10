"use client"

import { AttendData } from "@server/entity/attendData"
import { Community } from "@server/entity/community"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import axios from "@/config/axios"
import { useEffect } from "react"
import { atom, useAtom } from "jotai"
import { AttendStatus } from "@server/entity/types"

const groupInfoAtom = atom<Community | undefined>(undefined)
const worshipScheduleListAtom = atom<WorshipSchedule[]>([])
const selectedScheduleIdAtom = atom<number>(0)
const soonAttendDataAtom = atom<AttendData[]>([])

export default function useAttendance() {
  const [groupInfo, setGroupInfo] = useAtom(groupInfoAtom)
  const [worshipScheduleList, setWorshipScheduleList] = useAtom(
    worshipScheduleListAtom
  )
  const [selectedScheduleId, setSelectedScheduleId] = useAtom(
    selectedScheduleIdAtom
  )
  const [soonAttendData, setSoonAttendData] = useAtom(soonAttendDataAtom)

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
      `/soon/attendance/?scheduleId=${scheduleId}`
    )
    groupInfo?.users.forEach((user) => {
      if (
        !data.find(
          (d) => d.user.id === user.id && d.worshipSchedule.id === scheduleId
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
      "/soon/my-group-info"
    )
    setGroupInfo(groupInfo)
    const { data: worshipScheduleList } = await axios.get<WorshipSchedule[]>(
      "/soon/worship-schedule"
    )
    setWorshipScheduleList(worshipScheduleList)
    if (worshipScheduleList.length > 0) {
      setSelectedScheduleId(worshipScheduleList[0].id as number)
    }
  }

  return {
    groupInfo,
    worshipScheduleList,
    selectedScheduleId,
    setSelectedScheduleId,
    soonAttendData,
    setSoonAttendData,
    getAttendData,
  }
}

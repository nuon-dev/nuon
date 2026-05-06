import { useCallback, useState } from "react"
import axios from "@/config/axios"
import { AttendData } from "@server/entity/attendData"
import { AttendStatus } from "@server/entity/types"
import { User } from "@server/entity/user"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import {
  BulkAttendanceResponse,
  toAttendanceErrorMessage,
  toBulkResultMessage,
} from "@/util/attendanceError"
import { useNotification } from "@/hooks/useNotification"
import {
  StatusFilter,
  getUserAttendStatus,
} from "./utils/attendanceUtils"

export type UndoAction = {
  userIds: string[]
  previousStates: Map<string, { status: StatusFilter; memo: string }>
  newStatus: AttendStatus
  scheduleId: number
}

type Params = {
  scheduleId: number | ""
  attendMap: Map<string, AttendData>
  setAttendData: React.Dispatch<React.SetStateAction<AttendData[]>>
}

export function useBulkAttendance({
  scheduleId,
  attendMap,
  setAttendData,
}: Params) {
  const { success, error } = useNotification()
  const [saving, setSaving] = useState(false)
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null)

  const runBulkSave = useCallback(async function runBulkSave(
    checkedIds: Set<string>,
    status: AttendStatus,
    memo: string,
  ) {
    if (!scheduleId) return
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return

    // Undo용 스냅샷
    const previousStates = new Map<
      string,
      { status: StatusFilter; memo: string }
    >()
    ids.forEach((userId) => {
      previousStates.set(userId, {
        status: getUserAttendStatus(attendMap, userId),
        memo: attendMap.get(userId)?.memo || "",
      })
    })

    setSaving(true)
    let successfulIds: string[] = []
    let firstFailureMessage = ""
    try {
      const response = await axios.post<BulkAttendanceResponse>(
        "/admin/soon/update-attendance-bulk",
        {
          worshipScheduleId: scheduleId,
          items: ids.map((userId) => ({ userId, isAttend: status, memo })),
        },
      )
      successfulIds = response.data.results
        .filter((r) => r.status === "ok")
        .map((r) => r.userId)
      const firstFail = response.data.results.find((r) => r.status !== "ok")
      if (firstFail) firstFailureMessage = toBulkResultMessage(firstFail)
    } catch (e) {
      firstFailureMessage = toAttendanceErrorMessage(e)
    }

    setAttendData((prev) => {
      const map = new Map(prev.map((d) => [d.user.id, d]))
      successfulIds.forEach((userId) => {
        const existing = map.get(userId)
        if (existing) {
          map.set(userId, { ...existing, isAttend: status, memo })
        } else {
          map.set(userId, {
            id: "local-" + userId,
            user: { id: userId } as User,
            worshipSchedule: { id: Number(scheduleId) } as WorshipSchedule,
            isAttend: status,
            memo,
          } as AttendData)
        }
      })
      return Array.from(map.values())
    })

    setSaving(false)
    const failed = ids.length - successfulIds.length
    if (failed > 0) {
      error(
        firstFailureMessage
          ? `${failed}건 저장 실패 — ${firstFailureMessage}`
          : `${failed}건 저장 실패`,
      )
    }

    if (successfulIds.length > 0) {
      const snapshot = new Map<
        string,
        { status: StatusFilter; memo: string }
      >()
      successfulIds.forEach((id) => {
        const prev = previousStates.get(id)
        if (prev) snapshot.set(id, prev)
      })
      setUndoAction({
        userIds: successfulIds,
        previousStates: snapshot,
        newStatus: status,
        scheduleId: Number(scheduleId),
      })
    }
  }, [scheduleId, attendMap, setAttendData, error])

  const handleUndo = useCallback(async function handleUndo() {
    if (!undoAction) return
    const action = undoAction
    setUndoAction(null)

    const restorable = action.userIds.filter(
      (id) => action.previousStates.get(id)?.status !== "unrecorded",
    )
    const unrecoverable = action.userIds.length - restorable.length

    if (restorable.length === 0) {
      error("이전 상태가 '기록안됨'이라 복구할 수 없습니다")
      return
    }

    let successIds: string[] = []
    try {
      const response = await axios.post<BulkAttendanceResponse>(
        "/admin/soon/update-attendance-bulk",
        {
          worshipScheduleId: action.scheduleId,
          items: restorable.map((userId) => {
            const prev = action.previousStates.get(userId)!
            return { userId, isAttend: prev.status, memo: prev.memo }
          }),
        },
      )
      successIds = response.data.results
        .filter((r) => r.status === "ok")
        .map((r) => r.userId)
    } catch {
      // 네트워크 에러 등은 successIds 빈 배열로 떨어짐
    }

    setAttendData((prev) => {
      const map = new Map(prev.map((d) => [d.user.id, d]))
      successIds.forEach((userId) => {
        const target = action.previousStates.get(userId)!
        const existing = map.get(userId)
        if (existing) {
          map.set(userId, {
            ...existing,
            isAttend: target.status as AttendStatus,
            memo: target.memo,
          })
        }
      })
      return Array.from(map.values())
    })

    if (successIds.length === 0) {
      error("복구 실패")
      return
    }
    let msg = `${successIds.length}명 복구됨`
    if (unrecoverable > 0) msg += ` (${unrecoverable}명은 복구 불가)`
    success(msg)
  }, [undoAction, setAttendData, success, error])

  const dismissUndo = useCallback(() => setUndoAction(null), [])

  return { saving, undoAction, runBulkSave, handleUndo, dismissUndo }
}

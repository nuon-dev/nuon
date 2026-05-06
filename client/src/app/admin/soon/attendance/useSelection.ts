import { useCallback, useState } from "react"
import { User } from "@server/entity/user"
import { getGroupState } from "./utils/attendanceUtils"

export function useSelection() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const toggleUser = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // prev 안에서 그룹 상태를 계산해 stale 클로저 위험 제거.
  const toggleGroup = useCallback((users: User[]) => {
    setCheckedIds((prev) => {
      const state = getGroupState(prev, users)
      const next = new Set(prev)
      if (state === "all") users.forEach((u) => next.delete(u.id))
      else users.forEach((u) => next.add(u.id))
      return next
    })
  }, [])

  const clear = useCallback(() => setCheckedIds(new Set()), [])

  return { checkedIds, toggleUser, toggleGroup, clear }
}

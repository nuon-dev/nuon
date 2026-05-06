import { useEffect, useState } from "react"
import { User } from "@server/entity/user"

type Params = {
  usersByVillage: Map<number, User[]>
  usersByDarak: Map<number, User[]>
}

export function useDrillDownFocus({ usersByVillage, usersByDarak }: Params) {
  const [focusedVillageId, setFocusedVillageId] = useState<number | null>(null)
  const [focusedDarakId, setFocusedDarakId] = useState<number | null>(null)

  // 필터 변경으로 포커스 그룹이 비면 자동 해제
  useEffect(() => {
    if (
      focusedVillageId &&
      (usersByVillage.get(focusedVillageId)?.length ?? 0) === 0
    ) {
      setFocusedVillageId(null)
      setFocusedDarakId(null)
    } else if (
      focusedDarakId &&
      (usersByDarak.get(focusedDarakId)?.length ?? 0) === 0
    ) {
      setFocusedDarakId(null)
    }
  }, [usersByVillage, usersByDarak])

  function focusVillage(id: number) {
    setFocusedVillageId(id)
    setFocusedDarakId(null)
  }

  function focusDarak(id: number) {
    setFocusedDarakId(id)
  }

  function back() {
    if (focusedDarakId != null) setFocusedDarakId(null)
    else setFocusedVillageId(null)
  }

  return { focusedVillageId, focusedDarakId, focusVillage, focusDarak, back }
}

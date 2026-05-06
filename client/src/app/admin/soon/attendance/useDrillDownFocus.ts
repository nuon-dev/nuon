import { useCallback, useEffect, useState } from "react"
import { User } from "@server/entity/user"

type Params = {
  usersByVillage: Map<number, User[]>
  usersByDarak: Map<number, User[]>
}

export function useDrillDownFocus({ usersByVillage, usersByDarak }: Params) {
  const [focusedVillageId, setFocusedVillageId] = useState<number | null>(null)
  const [focusedDarakId, setFocusedDarakId] = useState<number | null>(null)

  // 필터 변경으로 포커스 그룹이 비면 자동 해제.
  // focus state는 의도적으로 deps에서 제외 — 새로 포커스한 시점엔 그룹이
  // 비어있을 수 없고, 이후 데이터가 줄어들 때만 검사가 의미 있다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const focusVillage = useCallback((id: number) => {
    setFocusedVillageId(id)
    setFocusedDarakId(null)
  }, [])

  const focusDarak = useCallback((id: number) => {
    setFocusedDarakId(id)
  }, [])

  // 다락방 → 마을 → null 순으로 한 단계씩 빠져나감.
  const back = useCallback(() => {
    setFocusedDarakId((prevDarak) => {
      if (prevDarak != null) return null
      setFocusedVillageId(null)
      return prevDarak
    })
  }, [])

  return { focusedVillageId, focusedDarakId, focusVillage, focusDarak, back }
}

import { User } from "@server/entity/user"
import { AttendData } from "@server/entity/attendData"
import { Community } from "@server/entity/community"
import { AttendStatus } from "@server/entity/types"

export type StatusFilter = "all" | "unrecorded" | "ATTEND" | "ABSENT" | "ETC"
export type GroupState = "none" | "some" | "all"

// 다락방 → 마을 ID. 트리 깊이가 비정상이면 시작 노드를 반환(무한 루프 방지).
export function findVillageId(
  parentMap: Map<number, number | null>,
  communityId: number,
): number {
  let cur = communityId
  for (let i = 0; i < 10; i++) {
    const parent = parentMap.get(cur)
    if (parent === null || parent === undefined) return cur
    cur = parent
  }
  return cur
}

export function getUserAttendStatus(
  attendMap: Map<string, AttendData>,
  userId: string,
): StatusFilter {
  const d = attendMap.get(userId)
  if (!d) return "unrecorded"
  return d.isAttend as StatusFilter
}

export function getGroupState(
  checkedIds: Set<string>,
  users: User[],
): GroupState {
  if (users.length === 0) return "none"
  const n = users.filter((u) => checkedIds.has(u.id)).length
  if (n === 0) return "none"
  if (n === users.length) return "all"
  return "some"
}

// 순장 → 부순장 → 이름순. 같은 다락방 내부 정렬용.
export function sortUsersByLeadership(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const aLead =
      a.community?.leader?.id === a.id
        ? -2
        : a.community?.deputyLeader?.id === a.id
          ? -1
          : 0
    const bLead =
      b.community?.leader?.id === b.id
        ? -2
        : b.community?.deputyLeader?.id === b.id
          ? -1
          : 0
    if (aLead !== bLead) return aLead - bLead
    return (a.name || "").localeCompare(b.name || "")
  })
}

// 검색 결과 평면 리스트 정렬: 마을 → 다락방 → 이름.
export function sortUsersByVillagePath(
  users: User[],
  parentMap: Map<number, number | null>,
): User[] {
  return [...users].sort((a, b) => {
    const aVid = a.community ? findVillageId(parentMap, a.community.id) : 0
    const bVid = b.community ? findVillageId(parentMap, b.community.id) : 0
    if (aVid !== bVid) return aVid - bVid
    const aDid = a.community?.id || 0
    const bDid = b.community?.id || 0
    if (aDid !== bDid) return aDid - bDid
    return (a.name || "").localeCompare(b.name || "")
  })
}

export function statusLabel(status: AttendStatus): string {
  if (status === AttendStatus.ATTEND) return "출석"
  if (status === AttendStatus.ABSENT) return "결석"
  return "기타"
}

export function buildParentMap(
  communities: Community[],
): Map<number, number | null> {
  const m = new Map<number, number | null>()
  communities.forEach((c) => m.set(c.id, c.parent?.id ?? null))
  return m
}

export function buildNameMap(communities: Community[]): Map<number, string> {
  const m = new Map<number, string>()
  communities.forEach((c) => m.set(c.id, c.name))
  return m
}

export function buildAttendMap(
  attendData: AttendData[],
): Map<string, AttendData> {
  const m = new Map<string, AttendData>()
  attendData.forEach((d) => m.set(d.user.id, d))
  return m
}

export function sortByCommunityId(a: User, b: User): number {
  if (a.community?.id !== b.community?.id) {
    return (a.community?.id || 0) - (b.community?.id || 0)
  }
  if (a.community?.leader?.id === a.id) {
    return -2 // a is leader, comes first
  }
  if (b.community?.leader?.id === b.id) {
    return 2 // b is leader, comes first
  }
  if (a.community?.deputyLeader?.id === a.id) {
    return -1 // a is deputy leader, comes before b
  }
  if (b.community?.deputyLeader?.id === b.id) {
    return 1 // b is deputy leader, comes before a
  }
  return a.name.localeCompare(b.name)
}

export function getAttendUserCount(
  attendDataList: AttendData[],
  worshipScheduleId: number
): { count: number; attend: number } {
  return attendDataList.reduce(
    (count, data) =>
      data.worshipSchedule.id === worshipScheduleId
        ? data.isAttend === AttendStatus.ATTEND
          ? {
              count: count.count + 1,
              attend: count.attend + 1,
            }
          : {
              count: count.count + 1,
              attend: count.attend,
            }
        : count,
    { count: 0, attend: 0 }
  )
}
import { jwtPayload } from "../util/type"
import { Community } from "../entity/community"
import { communityDatabase, userDatabase } from "./dataSource"

const COMMUNITY_CACHE_TTL_MS = 30_000
let cachedCommunityMap: Map<number, Community> | null = null
let cachedAt = 0

async function getCommunityMap(): Promise<Map<number, Community>> {
  const now = Date.now()
  if (cachedCommunityMap && now - cachedAt < COMMUNITY_CACHE_TTL_MS) {
    return cachedCommunityMap
  }
  const all = await communityDatabase.find({ relations: { children: true } })
  cachedCommunityMap = new Map(all.map((c) => [c.id, c]))
  cachedAt = now
  return cachedCommunityMap
}

async function isInSubtree(
  ancestorId: number | undefined,
  targetId: number | undefined,
): Promise<boolean> {
  if (!ancestorId || !targetId) return false
  if (ancestorId === targetId) return true

  const byId = await getCommunityMap()
  const visited = new Set<number>()

  function walk(id: number): boolean {
    if (visited.has(id)) return false
    visited.add(id)
    if (id === targetId) return true
    const node = byId.get(id)
    if (!node) return false
    return node.children.some((child) => walk(child.id))
  }
  return walk(ancestorId)
}

export async function canEditUserAttendance(
  requester: jwtPayload,
  targetUserId: string,
): Promise<boolean> {
  if (requester.role.Admin) return true

  const target = await userDatabase.findOne({
    where: { id: targetUserId },
    relations: { community: true },
  })
  if (!target?.community) return false

  if (requester.role.Leader) {
    return requester.community?.id === target.community.id
  }

  if (requester.role.VillageLeader) {
    return isInSubtree(requester.community?.id, target.community.id)
  }

  return false
}

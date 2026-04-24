import express from "express"
import { checkJwt, hasPermission } from "../../util/util"
import { PermissionType } from "../../entity/types"
import {
  attendDataDatabase,
  communityDatabase,
  userDatabase,
} from "../../model/dataSource"
import { In, Not, IsNull } from "typeorm"
import _ from "lodash"
import { jwtPayload } from "../../util/type"

const router = express.Router()

function toSafeUserResponse(user: any) {
  return {
    id: user.id,
    name: user.name,
    yearOfBirth: user.yearOfBirth,
    gender: user.gender,
    phone: user.phone,
    etc: user.etc,
    profile: user.profile,
    community: user.community,
    hasKakaoId: !!user.kakaoId,
  }
}

router.get("/get-all-user", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.userList))) {
    res.sendStatus(401)
    return
  }

  const foundUser = await userDatabase.find({
    where: {
      name: Not(IsNull()),
    },
  })

  res.send(foundUser.map(toSafeUserResponse))
})

router.post("/insert-user", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.editUserData))) {
    res.sendStatus(401)
    return
  }

  const user = req.body

  // 새 사용자 추가 시 빈 ID 제거 (UUID 자동 생성을 위해)
  if (!user.id || user.id === "") {
    delete user.id
  }

  const savedUser = await userDatabase.save(user)

  res.status(200).send(toSafeUserResponse(savedUser))
})

router.put("/update-user", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.editUserData))) {
    res.sendStatus(401)
    return
  }

  const user = req.body
  await userDatabase.save(user)

  res.status(200).send({ message: "success" })
})

router.delete("/delete-user/:id", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.editUserData))) {
    res.sendStatus(401)
    return
  }

  const userId = req.params.id // UUID는 문자열이므로 parseInt 제거
  await userDatabase.softDelete(userId)

  res.status(200).send({ message: "success" })
})

router.post("/get-soon-list", async (req, res) => {
  const communityIds = req.body.ids

  if (!communityIds) {
    res.status(400).send({ message: "No community IDs provided" })
    return
  }

  const ids = communityIds
    .toString()
    .split(",")
    .map((id) => parseInt(id, 10))

  const allOfCommunityList = await communityDatabase.find({
    relations: {
      children: true,
    },
  })

  function getAllChildIds(targetCommunityIds: number[]): number[] {
    const idsDoubleArray = targetCommunityIds.map((targetCommunityId) => {
      const foundCommunity = allOfCommunityList.find(
        (community) => community.id === targetCommunityId,
      )
      if (!foundCommunity) {
        return []
      }

      if (foundCommunity.children.length === 0) {
        return [foundCommunity.id]
      }

      const childIds = foundCommunity.children.map((child) => child.id)
      return getAllChildIds(childIds)
    })
    return _.flattenDeep(idsDoubleArray)
  }

  const communityOfChildIds = getAllChildIds(ids)

  const soonList = await userDatabase.find({
    where: {
      community: {
        id: In(communityOfChildIds),
      },
    },
    select: {
      id: true,
      name: true,
      gender: true,
      yearOfBirth: true,
      community: {
        id: true,
        name: true,
        leader: {
          id: true,
        },
        deputyLeader: {
          id: true,
        },
      },
    },
    relations: {
      community: {
        leader: true,
        deputyLeader: true,
      },
    },
  })

  res.status(200).send(soonList)
})

router.post("/user-attendance", async (req, res) => {
  const userIds = req.body.ids

  if (!userIds) {
    res.status(400).send({ message: "No user IDs provided" })
    return
  }

  const ids = userIds.toString().split(",")

  const attendDataList = await attendDataDatabase.find({
    where: {
      user: {
        id: In(ids),
      },
      worshipSchedule: {
        isVisible: true,
      },
    },
    relations: {
      user: true,
      worshipSchedule: true,
    },
  })
  res.status(200).send(attendDataList)
})

async function isInSubtree(
  ancestorId: number | undefined,
  targetId: number | undefined,
): Promise<boolean> {
  if (!ancestorId || !targetId) return false
  if (ancestorId === targetId) return true

  const all = await communityDatabase.find({ relations: { children: true } })
  const visited = new Set<number>()

  function walk(id: number): boolean {
    if (visited.has(id)) return false
    visited.add(id)
    if (id === targetId) return true
    const node = all.find((c) => c.id === id)
    if (!node) return false
    return node.children.some((child) => walk(child.id))
  }
  return walk(ancestorId)
}

async function canEditUserAttendance(
  requester: jwtPayload,
  targetUserId: string,
): Promise<boolean> {
  // Admin은 어느 유저든 편집 가능
  if (requester.role.Admin) return true

  // 출석 관리 권한이 있는 역할: Leader (자기 다락방) 또는 VillageLeader (마을 트리 하위 전체)
  if (!requester.role.Leader && !requester.role.VillageLeader) return false

  const target = await userDatabase.findOne({
    where: { id: targetUserId },
    relations: { community: true },
  })
  if (!target?.community) return false

  // 대상 유저의 community가 내 community의 하위(또는 동일)인지
  return await isInSubtree(requester.community?.id, target.community.id)
}

router.post("/update-attendance", async (req, res) => {
  const jwt = await checkJwt(req)
  if (!jwt) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  const { userId, worshipScheduleId, isAttend, memo } = req.body
  if (!userId || !worshipScheduleId || !isAttend) {
    res.status(400).send({ error: "Missing required fields" })
    return
  }

  const allowed = await canEditUserAttendance(jwt, userId)
  if (!allowed) {
    res.status(403).send({ error: "Forbidden" })
    return
  }

  const existing = await attendDataDatabase.findOne({
    where: {
      user: { id: userId },
      worshipSchedule: { id: worshipScheduleId },
    },
  })

  if (existing) {
    existing.isAttend = isAttend
    existing.memo = memo || ""
    await attendDataDatabase.save(existing)
    res.send({ result: "success" })
    return
  }

  await attendDataDatabase.save(
    attendDataDatabase.create({
      user: { id: userId },
      worshipSchedule: { id: worshipScheduleId },
      isAttend,
      memo: memo || "",
    }),
  )
  res.send({ result: "success" })
})

export default router

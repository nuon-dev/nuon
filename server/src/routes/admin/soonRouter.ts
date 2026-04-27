import express from "express"
import { checkJwt, hasPermission } from "../../util/util"
import { AttendStatus, PermissionType } from "../../entity/types"
import {
  attendDataDatabase,
  communityDatabase,
  userDatabase,
} from "../../model/dataSource"
import { canEditUserAttendance } from "../../model/attendance"
import { In, Not, IsNull } from "typeorm"
import _ from "lodash"

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

  if (!(Object.values(AttendStatus) as string[]).includes(isAttend)) {
    res.status(400).send({ error: "Invalid isAttend value" })
    return
  }

  if (memo !== undefined && memo !== null) {
    if (typeof memo !== "string") {
      res.status(400).send({ error: "Invalid memo type" })
      return
    }
    if (memo.length > 500) {
      res.status(400).send({ error: "Memo too long" })
      return
    }
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
    if (typeof memo === "string") {
      existing.memo = memo
    }
    await attendDataDatabase.save(existing)
    res.send({ result: "success" })
    return
  }

  await attendDataDatabase.save(
    attendDataDatabase.create({
      user: { id: userId },
      worshipSchedule: { id: worshipScheduleId },
      isAttend,
      memo: typeof memo === "string" ? memo : "",
    }),
  )
  res.send({ result: "success" })
})

const BULK_MAX_ITEMS = 100

type BulkResult = {
  index: number
  userId: string
  status: "ok" | "forbidden" | "invalid" | "error"
  error?: string
}

router.post("/update-attendance-bulk", async (req, res) => {
  const jwt = await checkJwt(req)
  if (!jwt) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  const { worshipScheduleId, items } = req.body
  if (!worshipScheduleId) {
    res.status(400).send({ error: "Missing worshipScheduleId" })
    return
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).send({ error: "Missing items" })
    return
  }
  if (items.length > BULK_MAX_ITEMS) {
    res.status(413).send({ error: "Too many items" })
    return
  }

  const results: BulkResult[] = await Promise.all(
    items.map(async (item, index): Promise<BulkResult> => {
      const { userId, isAttend, memo } = item ?? {}

      if (!userId || !isAttend) {
        return { index, userId, status: "invalid", error: "Missing required fields" }
      }
      if (!(Object.values(AttendStatus) as string[]).includes(isAttend)) {
        return { index, userId, status: "invalid", error: "Invalid isAttend value" }
      }
      if (memo !== undefined && memo !== null) {
        if (typeof memo !== "string") {
          return { index, userId, status: "invalid", error: "Invalid memo type" }
        }
        if (memo.length > 500) {
          return { index, userId, status: "invalid", error: "Memo too long" }
        }
      }

      const allowed = await canEditUserAttendance(jwt, userId)
      if (!allowed) {
        return { index, userId, status: "forbidden" }
      }

      try {
        const existing = await attendDataDatabase.findOne({
          where: {
            user: { id: userId },
            worshipSchedule: { id: worshipScheduleId },
          },
        })
        if (existing) {
          existing.isAttend = isAttend
          if (typeof memo === "string") {
            existing.memo = memo
          }
          await attendDataDatabase.save(existing)
        } else {
          await attendDataDatabase.save(
            attendDataDatabase.create({
              user: { id: userId },
              worshipSchedule: { id: worshipScheduleId },
              isAttend,
              memo: typeof memo === "string" ? memo : "",
            }),
          )
        }
        return { index, userId, status: "ok" }
      } catch {
        return { index, userId, status: "error", error: "Save failed" }
      }
    }),
  )

  const hasFailure = results.some((r) => r.status !== "ok")
  res.status(hasFailure ? 207 : 200).send({ results })
})

export default router

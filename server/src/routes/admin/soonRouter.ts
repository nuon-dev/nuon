import express from "express"
import { hasPermission } from "../../util/util"
import { PermissionType } from "../../entity/types"
import {
  attendDataDatabase,
  communityDatabase,
  userDatabase,
} from "../../model/dataSource"
import { In, Not, IsNull } from "typeorm"
import _ from "lodash"

const router = express.Router()

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

  res.send(foundUser)
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

  res.status(200).send(savedUser)
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
        (community) => community.id === targetCommunityId
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

export default router

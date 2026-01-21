import express from "express"

import {
  attendDataDatabase,
  communityDatabase,
  userDatabase,
  worshipScheduleDatabase,
} from "../../model/dataSource"
import { checkJwt, getUserFromToken } from "../../util/util"
import { Community } from "../../entity/community"
import { User } from "../../entity/user"
import { In } from "typeorm"
import { getKakaoIdFromAccessToken } from "../../util/auth"

const router = express.Router()

async function getAllSoonUsers(community: Community) {
  const communityWithRelations = await communityDatabase.findOne({
    where: { id: community.id },
    relations: { children: true, users: true },
  })
  let users: User[] = []

  const childUsersPromise = await communityWithRelations.children.map(
    async (childCommunity) => {
      return await getAllSoonUsers(childCommunity)
    },
  )
  const awaitedChildUsers = (await Promise.all(childUsersPromise)).flat()

  return [...communityWithRelations.users, ...awaitedChildUsers]
}

router.get("/my-group-info", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  const group = user.community
  if (!group) {
    res.status(404).send({ error: "Group not found" })
    return
  }
  const allUsers = await getAllSoonUsers(group)
  group.users = allUsers.map(
    (user) =>
      ({
        id: user.id,
        name: user.name,
        yearOfBirth: user.yearOfBirth,
        phone: user.phone,
        gender: user.gender,
        kakaoId: !!user.kakaoId,
      }) as any,
  )

  res.send(group)
})

router.post("/add-user", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  const { userName, yearOfBirth, gender, phone } = req.body
  if (!userName || !yearOfBirth || !gender || !phone) {
    res.status(400).send({ error: "Missing required fields" })
    return
  }

  // phone에서 숫자가 아닌 문자 제거 (하이픈, 공백 등)
  const cleanPhone = phone.replace(/[^\d]/g, "")

  const existingUser = await userDatabase.findOne({
    where: {
      name: userName,
      yearOfBirth: parseInt(yearOfBirth, 10),
      gender,
      phone: cleanPhone,
    },
  })

  // 4개가 모두 같다면 동일인 처리
  if (existingUser) {
    existingUser.community = user.community
    await userDatabase.save(existingUser)
    res.status(201).send(existingUser)
    return
  }

  const newSoon = userDatabase.create({
    name: userName,
    yearOfBirth: parseInt(yearOfBirth, 10),
    gender,
    phone,
    community: user.community,
  })

  try {
    await userDatabase.save(newSoon)
    res.status(201).send(newSoon)
  } catch (error) {
    console.error("Error saving new user:", error)
    res.status(500).send({ error: "Failed to add user" })
  }
})

router.get("/worship-schedule", async (req, res) => {
  const schedules = await worshipScheduleDatabase.find({
    order: {
      date: "DESC",
    },
    where: {
      canEdit: true,
    },
  })
  if (!schedules) {
    res.status(404).send({ error: "No worship schedules found" })
    return
  }
  res.status(200).send(schedules)
})

router.get("/attendance", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  const scheduleId = parseInt(req.query.scheduleId as string, 10)

  if (isNaN(scheduleId)) {
    res.status(400).send({ error: "Invalid schedule ID" })
    return
  }

  const childrenUsers = await getAllSoonUsers(user.community)
  const userIds = childrenUsers.map((user) => user.id)

  const attendDataList = await attendDataDatabase.find({
    where: {
      worshipSchedule: {
        id: scheduleId,
      },
      user: {
        id: In(userIds),
      },
    },
    relations: {
      user: {
        community: true,
      },
      worshipSchedule: true,
    },
  })

  res.status(200).send(attendDataList)
})

router.post("/attendance", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  const { scheduleId, attendData } = req.body
  if (!scheduleId || !attendData) {
    res.status(400).send({ error: "Missing required fields" })
    return
  }

  const worshipSchedule = await worshipScheduleDatabase.findOne({
    where: { id: scheduleId },
  })
  if (!worshipSchedule) {
    res.status(404).send({ error: "Worship schedule not found" })
    return
  }

  const attendDataList = attendData.map(async (data: any) => {
    const foundAttendData = await attendDataDatabase.findOne({
      where: {
        user: { id: data.user.id },
        worshipSchedule: { id: worshipSchedule.id },
      },
    })
    if (foundAttendData) {
      foundAttendData.isAttend = data.isAttend
      foundAttendData.memo = data.memo || ""
      return foundAttendData
    }
    return attendDataDatabase.create({
      memo: data.memo || "",
      worshipSchedule,
      user: { id: data.user.id },
      isAttend: data.isAttend,
    })
  })

  try {
    await attendDataDatabase.save(await Promise.all(attendDataList))
    res.status(201).send(attendDataList)
  } catch (error) {
    console.error("Error saving attendance data:", error)
    res.status(500).send({ error: "Failed to save attendance data" })
  }
})

router.post("/register-kakao-login", async (req, res) => {
  const { userId, kakaoToken } = req.body

  const kakaoId = await getKakaoIdFromAccessToken(kakaoToken)

  const existingUsers = await userDatabase.findOne({
    where: {
      kakaoId: kakaoId,
    },
  })

  if (existingUsers) {
    res
      .status(400)
      .send({ error: "이미 등록어 있는 카카오 계정 입니다." + `(${kakaoId})` })
    return
  }

  await userDatabase.update({ id: userId }, { kakaoId })

  res
    .status(200)
    .send({ message: "정상적으로 등록 되었습니다.\n창을 닫으셔도 됩니다." })
})

router.get("/isValid-kakao-login-register", async (req, res) => {
  const userId = req.query.userId as string
  if (!userId) {
    res.status(400).send({ error: "Missing userId parameter" })
    return
  }

  const user = await userDatabase.findOne({
    where: {
      id: userId,
    },
  })

  if (!user) {
    res.status(404).send({ error: "User not found" })
    return
  }

  if (user.kakaoId) {
    res
      .status(400)
      .send({ error: "Kakao login is already registered for this user." })
    return
  }

  res
    .status(200)
    .send({ message: "Kakao login can be registered for this user." })
})

router.get("/my-info", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  res.status(200).send({
    id: user.id,
    name: user.name,
    yearOfBirth: user.yearOfBirth,
    phone: user.phone,
    gender: user.gender,
    kakaoId: !!user.kakaoId,
    community: user.community,
  })
})

router.get("/existing-users", async (req, res) => {
  const user = await checkJwt(req)
  console.log("user", user)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  if (!user.role.Leader) {
    res.status(403).send({ error: "Forbidden" })
    return
  }

  const phone = req.query.phone as string
  if (!phone) {
    res.status(400).send({ error: "Missing phone parameter" })
    return
  }

  const existingUser = await userDatabase.findOne({
    where: {
      phone: phone,
      community: {
        id: user.community.id,
      },
    },
  })

  if (!existingUser) {
    res.status(404).send()
    return
  }

  res.status(200).send({
    id: existingUser.id,
    name: existingUser.name,
    yearOfBirth: existingUser.yearOfBirth,
    gender: existingUser.gender,
    kakaoId: existingUser.kakaoId,
  })
})

router.get("/retreat-attendance-records", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }
  if (!user.role.Leader) {
    res.status(403).send({ error: "Forbidden" })
    return
  }

  const childrenUsers = await getAllSoonUsers(user.community)
  const userIds = childrenUsers.map((user) => user.id)

  let attendDataList = await userDatabase.find({
    where: {
      id: In(userIds),
    },
    select: {
      id: true,
      name: true,
      yearOfBirth: true,
      gender: true,
      phone: true,
      retreatAttend: {
        id: true,
        isWorker: true,
        isHalf: true,
        createAt: true,
      },
    },
    relations: {
      retreatAttend: true,
    },
  })

  attendDataList = attendDataList.filter((soon) => {
    if (!soon.retreatAttend) {
      return true
    }
    if (soon.retreatAttend.isCanceled) {
      return false
    }
    return true
  })
  res.status(200).send(attendDataList)
})

export default router

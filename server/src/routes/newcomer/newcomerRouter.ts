import express from "express"

import {
  communityDatabase,
  newcomerDatabase,
  newcomerEducationDatabase,
  newcomerManagerDatabase,
  userDatabase,
  worshipScheduleDatabase,
} from "../../model/dataSource"
import { checkJwt } from "../../util/util"
import { EducationLecture, NewcomerStatus } from "../../entity/types"

const router = express.Router()

// 현재 유저에 해당하는 NewcomerManager를 찾거나 생성
async function getOrCreateNewcomerManager(user: any) {
  let manager = await newcomerManagerDatabase.findOne({
    where: { user: { id: user.id } },
  })

  if (!manager) {
    manager = newcomerManagerDatabase.create({ user })
    await newcomerManagerDatabase.save(manager)
  }

  return manager
}

// 1. 새신자 등록
router.post("/", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  const { name, yearOfBirth, gender, phone, guiderId, assignmentId } = req.body

  if (!name) {
    res.status(400).send({ error: "이름은 필수입니다." })
    return
  }

  try {
    // 인도자 확인
    let guider = null
    if (guiderId) {
      guider = await userDatabase.findOne({ where: { id: guiderId } })
    }

    // NewcomerManager 찾거나 생성
    const newcomerManager = await getOrCreateNewcomerManager(user)

    // 배정(Community) 확인
    let assignment = null
    if (assignmentId) {
      assignment = await communityDatabase.findOne({
        where: { id: assignmentId },
      })
    }

    const newcomer = newcomerDatabase.create({
      name,
      yearOfBirth: yearOfBirth ? parseInt(yearOfBirth, 10) : null,
      gender: gender || null,
      phone: phone?.replace(/[^\d]/g, "") || null,
      guider,
      assignment,
      newcomerManager,
      status: NewcomerStatus.NORMAL,
    })

    await newcomerDatabase.save(newcomer)
    res.status(201).send(newcomer)
  } catch (error) {
    console.error("Error creating newcomer:", error)
    res.status(500).send({ error: "새신자 등록에 실패했습니다." })
  }
})

// 2. 새신자 조회 (리스트)
router.get("/", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  try {
    const status = req.query.status as NewcomerStatus | undefined

    const whereCondition: any = {}
    if (status) {
      whereCondition.status = status
    }

    const newcomers = await newcomerDatabase.find({
      where: whereCondition,
      relations: {
        guider: true,
        assignment: true,
        newcomerManager: {
          user: true,
        },
        educationRecords: {
          worshipSchedule: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    })

    // 민감한 정보 제거
    const sanitizedNewcomers = newcomers.map((newcomer) => ({
      ...newcomer,
      guider: newcomer.guider
        ? { id: newcomer.guider.id, name: newcomer.guider.name }
        : null,
      assignment: newcomer.assignment
        ? { id: newcomer.assignment.id, name: newcomer.assignment.name }
        : null,
      newcomerManager: newcomer.newcomerManager?.user
        ? {
            id: newcomer.newcomerManager.id,
            user: {
              id: newcomer.newcomerManager.user.id,
              name: newcomer.newcomerManager.user.name,
            },
          }
        : null,
    }))

    res.status(200).send(sanitizedNewcomers)
  } catch (error: any) {
    console.error("Error fetching newcomers:", error.message, error.stack)
    res.status(500).send({
      error: "새신자 목록 조회에 실패했습니다.",
      detail: error.message,
    })
  }
})

// 3. 새신자 교육 출석 조회 (날짜별 테이블 형식 - 출석 테이블과 동일한 구조)
router.get("/education", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  try {
    const status = req.query.status as NewcomerStatus | undefined

    const whereCondition: any = {}
    if (status) {
      whereCondition.status = status
    }

    // 새신자 조회 (교육 기록 포함)
    const newcomers = await newcomerDatabase.find({
      where: whereCondition,
      relations: {
        guider: true,
        assignment: true,
        newcomerManager: {
          user: true,
        },
        educationRecords: {
          worshipSchedule: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    })

    // 최근 8주간의 예배 스케줄 조회
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
    const eightWeeksAgoStr = eightWeeksAgo.toISOString().split("T")[0]

    const recentSchedules = await worshipScheduleDatabase
      .createQueryBuilder("schedule")
      .where("schedule.date >= :startDate", { startDate: eightWeeksAgoStr })
      .orderBy("schedule.date", "DESC")
      .getMany()

    console.log("eightWeeksAgoStr:", eightWeeksAgoStr)
    console.log("recentSchedules count:", recentSchedules.length)

    // 날짜별 스케줄 맵 생성
    const worshipScheduleMap: Record<string, any> = {}
    const sortedDates: string[] = []

    recentSchedules.forEach((schedule) => {
      if (!worshipScheduleMap[schedule.date]) {
        worshipScheduleMap[schedule.date] = {
          id: schedule.id,
          date: schedule.date,
        }
        sortedDates.push(schedule.date)
      }
    })

    console.log("sortedDates:", sortedDates)

    // 테이블 형식으로 변환: 각 새신자별로 날짜 → 강의 타입 매핑
    const educationTable = newcomers.map((newcomer) => {
      // 날짜별 교육 기록 맵핑
      const educationByDate: Record<string, any> = {}

      newcomer.educationRecords?.forEach((record) => {
        if (record.worshipSchedule?.date) {
          educationByDate[record.worshipSchedule.date] = {
            id: record.id,
            lectureType: record.lectureType,
            worshipScheduleId: record.worshipSchedule.id,
            memo: record.memo,
          }
        }
      })

      return {
        id: newcomer.id,
        name: newcomer.name,
        yearOfBirth: newcomer.yearOfBirth,
        gender: newcomer.gender,
        phone: newcomer.phone,
        status: newcomer.status,
        guider: newcomer.guider
          ? { id: newcomer.guider.id, name: newcomer.guider.name }
          : null,
        newcomerManager: newcomer.newcomerManager?.user
          ? {
              id: newcomer.newcomerManager.id,
              user: {
                id: newcomer.newcomerManager.user.id,
                name: newcomer.newcomerManager.user.name,
              },
            }
          : null,
        assignment: newcomer.assignment
          ? { id: newcomer.assignment.id, name: newcomer.assignment.name }
          : null,
        createdAt: newcomer.createdAt,
        education: educationByDate, // { "2026-01-11": { lectureType: "OT" }, ... }
      }
    })

    res.status(200).send({
      dates: sortedDates, // 테이블 헤더용 날짜 목록
      worshipSchedules: sortedDates.map((date) => worshipScheduleMap[date]),
      newcomers: educationTable,
    })
  } catch (error) {
    console.error("Error fetching newcomers education:", error)
    res.status(500).send({ error: "교육 출석 조회에 실패했습니다." })
  }
})

// 4. 새신자 교육 등록/업데이트
router.put("/:id/education", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  const newcomerId = req.params.id
  const { lectureType, worshipScheduleId, memo } = req.body

  if (!lectureType) {
    res.status(400).send({ error: "강의 타입은 필수입니다." })
    return
  }

  // lectureType 유효성 검사
  if (!Object.values(EducationLecture).includes(lectureType)) {
    res.status(400).send({ error: "유효하지 않은 강의 타입입니다." })
    return
  }

  try {
    const newcomer = await newcomerDatabase.findOne({
      where: { id: newcomerId },
    })

    if (!newcomer) {
      res.status(404).send({ error: "새신자를 찾을 수 없습니다." })
      return
    }

    // 해당 강의 타입의 기존 기록 확인
    let educationRecord = await newcomerEducationDatabase.findOne({
      where: {
        newcomer: { id: newcomerId },
        lectureType: lectureType,
      },
    })

    let worshipSchedule = null
    if (worshipScheduleId) {
      worshipSchedule = await worshipScheduleDatabase.findOne({
        where: { id: worshipScheduleId },
      })
    }

    if (educationRecord) {
      // 기존 기록 업데이트
      educationRecord.worshipSchedule = worshipSchedule
      educationRecord.memo = memo || null
      await newcomerEducationDatabase.save(educationRecord)
    } else {
      // 새 기록 생성
      educationRecord = newcomerEducationDatabase.create({
        newcomer,
        lectureType,
        worshipSchedule,
        memo: memo || null,
      })
      await newcomerEducationDatabase.save(educationRecord)
    }

    res.status(200).send(educationRecord)
  } catch (error) {
    console.error("Error updating newcomer education:", error)
    res.status(500).send({ error: "교육 정보 업데이트에 실패했습니다." })
  }
})

export default router

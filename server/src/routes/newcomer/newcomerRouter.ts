import express from "express"

import {
  newcomerDatabase,
  newcomerEducationDatabase,
  userDatabase,
  worshipScheduleDatabase,
} from "../../model/dataSource"
import { checkJwt } from "../../util/util"
import { EducationLecture, NewcomerStatus } from "../../entity/types"

const router = express.Router()

// 1. 새신자 등록
router.post("/", async (req, res) => {
  const user = await checkJwt(req)
  if (!user) {
    res.status(401).send({ error: "Unauthorized" })
    return
  }

  const { name, yearOfBirth, gender, phone, guiderId, assignment } = req.body

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

    const newcomer = newcomerDatabase.create({
      name,
      yearOfBirth: yearOfBirth ? parseInt(yearOfBirth, 10) : null,
      gender: gender || null,
      phone: phone?.replace(/[^\d]/g, "") || null,
      guider,
      assignment: assignment || null,
      manager: user,
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
        manager: true,
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
      manager: newcomer.manager
        ? { id: newcomer.manager.id, name: newcomer.manager.name }
        : null,
    }))

    res.status(200).send(sanitizedNewcomers)
  } catch (error) {
    console.error("Error fetching newcomers:", error)
    res.status(500).send({ error: "새신자 목록 조회에 실패했습니다." })
  }
})

// 3. 새신자 교육 출석 조회 (모든 새신자 + 교육 현황 테이블)
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

    const newcomers = await newcomerDatabase.find({
      where: whereCondition,
      relations: {
        guider: true,
        manager: true,
        educationRecords: {
          worshipSchedule: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    })

    // 테이블 형식으로 변환: 각 새신자별 교육 수강 현황
    const educationTable = newcomers.map((newcomer) => {
      // 교육 기록을 lectureType 기준으로 맵핑
      const educationMap: Record<string, any> = {}
      for (const lecture of Object.values(EducationLecture)) {
        const record = newcomer.educationRecords?.find(
          (r) => r.lectureType === lecture,
        )
        educationMap[lecture] = record
          ? {
              id: record.id,
              completed: true,
              worshipSchedule: record.worshipSchedule,
              memo: record.memo,
            }
          : { completed: false }
      }

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
        manager: newcomer.manager
          ? { id: newcomer.manager.id, name: newcomer.manager.name }
          : null,
        assignment: newcomer.assignment,
        createdAt: newcomer.createdAt,
        education: educationMap,
      }
    })

    res.status(200).send(educationTable)
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

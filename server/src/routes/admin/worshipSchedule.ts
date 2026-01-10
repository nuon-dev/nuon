import express from "express"
import { worshipScheduleDatabase } from "../../model/dataSource"
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm"
import { WorshipSchedule } from "../../entity/worshipSchedule"

const router = express.Router()

router.get("/", async (req, res) => {
  const { startDate, endDate, kind, canEdit, isVisible } = req.query
  const where: FindOptionsWhere<WorshipSchedule> = {}

  if (startDate && endDate) {
    where.date = Between(String(startDate), String(endDate))
  } else if (startDate) {
    where.date = MoreThanOrEqual(String(startDate))
  } else if (endDate) {
    where.date = LessThanOrEqual(String(endDate))
  }

  if (kind) {
    where.kind = Number(kind)
  }

  if (canEdit !== undefined) {
    where.canEdit = canEdit === "true"
  }

  if (isVisible !== undefined) {
    where.isVisible = isVisible === "true"
  }

  const data = await worshipScheduleDatabase.find({
    where,
    order: {
      date: "DESC",
    },
  })
  res.status(200).send(data)
})

router.post("/", async (req, res) => {
  const schedule = req.body
  await worshipScheduleDatabase.insert(schedule)
  res.status(200).send({ message: "success" })
})

router.put("/", async (req, res) => {
  const schedule = req.body
  await worshipScheduleDatabase.save(schedule)
  res.status(200).send({ message: "success" })
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  await worshipScheduleDatabase.delete(id)
  res.status(200).send({ message: "success" })
})

export default router

import { bulletinImageDatabase } from "./dataSource"
import type { BulletinImage } from "../entity/bulletinImage"

export const BULLETIN_IMAGE_SLOTS = [1, 2] as const
export type BulletinImageSlot = (typeof BULLETIN_IMAGE_SLOTS)[number]

export interface BulletinWeek {
  weekDate: string
  images: BulletinImage[]
}

export function isBulletinImageSlot(value: number): value is BulletinImageSlot {
  return BULLETIN_IMAGE_SLOTS.includes(value as BulletinImageSlot)
}

export function isSundayDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getDay() === 0
  )
}

function getKoreaToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = Number(parts.find((part) => part.type === "year")?.value)
  const month = Number(parts.find((part) => part.type === "month")?.value)
  const day = Number(parts.find((part) => part.type === "day")?.value)

  return new Date(year, month - 1, day)
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeDate(value: string | Date) {
  return value instanceof Date ? formatDate(value) : value.slice(0, 10)
}

export function getNextSundayDateString() {
  const today = getKoreaToday()
  const daysUntilNextSunday = today.getDay() === 0 ? 0 : 7 - today.getDay()
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + daysUntilNextSunday)
  return formatDate(nextSunday)
}

function groupByWeek(images: BulletinImage[]): BulletinWeek[] {
  const weeks = new Map<string, BulletinWeek>()

  for (const image of images) {
    const weekDate = normalizeDate(image.weekDate)
    const normalizedImage = { ...image, weekDate }
    const week = weeks.get(weekDate) || {
      weekDate,
      images: [],
    }
    week.images.push(normalizedImage)
    weeks.set(weekDate, week)
  }

  return Array.from(weeks.values())
}

async function getWeeks() {
  const images = await bulletinImageDatabase.find({
    order: {
      weekDate: "DESC",
      slot: "ASC",
    },
  })
  return groupByWeek(images)
}

const BulletinImageModel = {
  async getPublicWeeks() {
    return getWeeks()
  },

  async getAdminWeeks() {
    return getWeeks()
  },

  async saveImageInSlot(
    weekDate: string,
    slot: BulletinImageSlot,
    filename: string,
    originalName: string,
  ) {
    const previousBulletinImage = await bulletinImageDatabase.findOne({
      where: { weekDate, slot },
    })
    const bulletinImage = bulletinImageDatabase.create({
      weekDate,
      slot,
      filename,
      originalName,
    })
    return {
      bulletinImage: await bulletinImageDatabase.save(bulletinImage),
      previousFilename: previousBulletinImage?.filename,
    }
  },

  async deleteImageBySlot(weekDate: string, slot: BulletinImageSlot) {
    const bulletinImage = await bulletinImageDatabase.findOne({
      where: { weekDate, slot },
    })
    if (!bulletinImage) {
      return null
    }
    await bulletinImageDatabase.delete({ weekDate, slot })
    return bulletinImage
  },
}

export default BulletinImageModel

export type BulletinImageSlot = 1 | 2

export interface BulletinImage {
  weekDate: string
  slot: BulletinImageSlot
  filename: string
  originalName: string
  createdAt: string
  updatedAt: string
}

export interface BulletinWeek {
  weekDate: string
  images: BulletinImage[]
}

export interface AdminBulletinResponse {
  weeks: BulletinWeek[]
  nextWeekDate: string
}

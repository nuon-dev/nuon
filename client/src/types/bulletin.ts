export type BulletinImageSlot = 1 | 2

export interface BulletinImage {
  slot: BulletinImageSlot
  filename: string
  originalName: string
  createdAt: string
  updatedAt: string
}

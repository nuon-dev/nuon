import { bulletinImageDatabase } from "./dataSource"

export const BULLETIN_IMAGE_SLOTS = [1, 2] as const
export type BulletinImageSlot = (typeof BULLETIN_IMAGE_SLOTS)[number]

export function isBulletinImageSlot(value: number): value is BulletinImageSlot {
  return BULLETIN_IMAGE_SLOTS.includes(value as BulletinImageSlot)
}

const BulletinImageModel = {
  async getAllImages() {
    return bulletinImageDatabase.find({
      order: {
        slot: "ASC",
      },
    })
  },

  async saveImageInSlot(
    slot: BulletinImageSlot,
    filename: string,
    originalName: string,
  ) {
    const previousBulletinImage = await bulletinImageDatabase.findOne({
      where: { slot },
    })
    const bulletinImage = bulletinImageDatabase.create({
      slot,
      filename,
      originalName,
    })
    return {
      bulletinImage: await bulletinImageDatabase.save(bulletinImage),
      previousFilename: previousBulletinImage?.filename,
    }
  },

  async deleteImageBySlot(slot: BulletinImageSlot) {
    const bulletinImage = await bulletinImageDatabase.findOne({ where: { slot } })
    if (!bulletinImage) {
      return null
    }
    await bulletinImageDatabase.delete(slot)
    return bulletinImage
  },
}

export default BulletinImageModel

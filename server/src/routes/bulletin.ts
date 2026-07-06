import crypto from "crypto"
import express, { Router } from "express"
import fs from "fs"
import multer from "multer"
import path from "path"
import { PermissionType } from "../entity/types"
import BulletinImageModel, {
  getNextSundayDateString,
  isBulletinImageSlot,
  isSundayDateString,
} from "../model/bulletin"
import type { BulletinImageSlot } from "../model/bulletin"
import { getUserFromToken, hasPermissionFromReq } from "../util/util"

const router: Router = express.Router()
export const adminBulletinRouter: Router = express.Router()

export const bulletinImagePath = path.resolve(__dirname, "../../../bulletin/image")
const maxBulletinImageSize = 10 * 1024 * 1024
const bulletinImageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
} as const

function getBulletinImageExtension(mimetype: string) {
  return bulletinImageExtensions[
    mimetype as keyof typeof bulletinImageExtensions
  ]
}

async function isValidBulletinImageFile(file: Express.Multer.File) {
  const buffer = await fs.promises.readFile(file.path)
  const asciiHeader = buffer.subarray(0, 12).toString("ascii")

  return (
    (file.mimetype === "image/jpeg" &&
      buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
    (file.mimetype === "image/png" &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (file.mimetype === "image/gif" &&
      (asciiHeader.startsWith("GIF87a") || asciiHeader.startsWith("GIF89a"))) ||
    (file.mimetype === "image/webp" &&
      asciiHeader.startsWith("RIFF") &&
      asciiHeader.slice(8, 12) === "WEBP")
  )
}

const uploadBulletinImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(bulletinImagePath, { recursive: true }, (error) => {
        callback(error, bulletinImagePath)
      })
    },
    filename: (req, file, callback) => {
      callback(
        null,
        `${Date.now()}-${crypto.randomUUID()}${getBulletinImageExtension(file.mimetype)}`,
      )
    },
  }),
  limits: {
    fileSize: maxBulletinImageSize,
  },
  fileFilter: (req, file, callback) => {
    callback(null, Boolean(getBulletinImageExtension(file.mimetype)))
  },
})

function getBulletinImageSlot(value: string): BulletinImageSlot | null {
  const slot = Number(value)
  if (!Number.isInteger(slot) || !isBulletinImageSlot(slot)) {
    return null
  }
  return slot
}

function getBulletinWeekDate(value: string) {
  return isSundayDateString(value) ? value : null
}

function removeBulletinImageFile(filename?: string) {
  if (!filename) {
    return
  }
  fs.unlink(path.join(bulletinImagePath, filename), () => {})
}

router.get("/", async (req, res) => {
  try {
    const bulletinWeeks = await BulletinImageModel.getPublicWeeks()
    res.status(200).json(bulletinWeeks)
  } catch (error) {
    console.error("Error fetching bulletin weeks:", error)
    res.status(500).json({ error: "Failed to fetch bulletin weeks" })
  }
})

adminBulletinRouter.get("/", async (req, res) => {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const bulletinWeeks = await BulletinImageModel.getAdminWeeks()
    res.status(200).json({
      weeks: bulletinWeeks,
      nextWeekDate: getNextSundayDateString(),
    })
  } catch (error) {
    console.error("Error fetching admin bulletin weeks:", error)
    res.status(500).json({ error: "Failed to fetch bulletin weeks" })
  }
})

adminBulletinRouter.put("/:weekDate/:slot", async (req, res) => {
  const weekDate = getBulletinWeekDate(req.params.weekDate)
  if (!weekDate) {
    res.status(400).json({ error: "Invalid bulletin week date" })
    return
  }

  const imageSlot = getBulletinImageSlot(req.params.slot)
  if (!imageSlot) {
    res.status(400).json({ error: "Invalid bulletin image slot" })
    return
  }

  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden" })
    return
  }

  uploadBulletinImage.single("image")(req, res, async (error) => {
    try {
      if (error) {
        res.status(400).json({ error: "Failed to upload image" })
        return
      }
      if (!req.file) {
        res.status(400).json({ error: "Image file is required" })
        return
      }
      if (!(await isValidBulletinImageFile(req.file))) {
        removeBulletinImageFile(req.file.filename)
        res.status(400).json({ error: "Invalid image file" })
        return
      }

      const { bulletinImage, previousFilename } =
        await BulletinImageModel.saveImageInSlot(
          weekDate,
          imageSlot,
          req.file.filename,
          req.file.originalname,
        )
      if (previousFilename && previousFilename !== req.file.filename) {
        removeBulletinImageFile(previousFilename)
      }
      res.status(previousFilename ? 200 : 201).json(bulletinImage)
    } catch (error) {
      removeBulletinImageFile(req.file?.filename)
      console.error("Error creating bulletin image:", error)
      res.status(500).json({ error: "Failed to create bulletin image" })
    }
  })
})

adminBulletinRouter.delete("/:weekDate/:slot", async (req, res) => {
  try {
    const weekDate = getBulletinWeekDate(req.params.weekDate)
    if (!weekDate) {
      res.status(400).json({ error: "Invalid bulletin week date" })
      return
    }

    const imageSlot = getBulletinImageSlot(req.params.slot)
    if (!imageSlot) {
      res.status(400).json({ error: "Invalid bulletin image slot" })
      return
    }

    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const bulletinImage = await BulletinImageModel.deleteImageBySlot(
      weekDate,
      imageSlot,
    )
    if (!bulletinImage) {
      res.status(404).json({ error: "Image not found" })
      return
    }

    removeBulletinImageFile(bulletinImage.filename)
    res.status(200).json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Error deleting bulletin image:", error)
    res.status(500).json({ error: "Failed to delete bulletin image" })
  }
})

export default router

import crypto from "crypto"
import express, { Router } from "express"
import fs from "fs"
import multer from "multer"
import path from "path"
import { PermissionType } from "../entity/types"
import BulletinImageModel, { isBulletinImageSlot } from "../model/bulletin"
import type { BulletinImageSlot } from "../model/bulletin"
import { getUserFromToken, hasPermissionFromReq } from "../util/util"

const router: Router = express.Router()

export const bulletinImagePath = path.resolve(__dirname, "../../../bulletin/image")
const maxBulletinImageSize = 10 * 1024 * 1024

try {
  fs.mkdirSync(bulletinImagePath, { recursive: true })
} catch (err) {
  console.error("Failed to create bulletin image directory:", err)
}

const uploadBulletinImage = multer({
  storage: multer.diskStorage({
    destination: bulletinImagePath,
    filename: (req, file, callback) => {
      callback(
        null,
        `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`,
      )
    },
  }),
  limits: {
    fileSize: maxBulletinImageSize,
  },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"))
  },
})

function getBulletinImageSlot(value: string): BulletinImageSlot | null {
  const slot = Number(value)
  if (!Number.isInteger(slot) || !isBulletinImageSlot(slot)) {
    return null
  }
  return slot
}

function removeBulletinImageFile(filename?: string) {
  if (!filename) {
    return
  }
  fs.unlink(path.join(bulletinImagePath, filename), () => {})
}

router.get("/", async (req, res) => {
  try {
    const bulletinImages = await BulletinImageModel.getAllImages()
    res.status(200).json(bulletinImages)
  } catch (error) {
    console.error("Error fetching bulletin images:", error)
    res.status(500).json({ error: "Failed to fetch bulletin images" })
  }
})

router.put("/:slot", async (req, res) => {
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

      const { bulletinImage, previousFilename } =
        await BulletinImageModel.saveImageInSlot(
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

router.delete("/:slot", async (req, res) => {
  try {
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

    const bulletinImage = await BulletinImageModel.deleteImageBySlot(imageSlot)
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

import express, { Router } from "express"
import LinkModel from "../model/link"
import { getUserFromToken, hasPermissionFromReq } from "../util/util"
import { PermissionType } from "../entity/types"

const router: Router = express.Router()

router.get("/", async (req, res) => {
  try {
    const links = await LinkModel.getAllLinks()
    res.status(200).json(links)
  } catch (error) {
    console.error("Error fetching links:", error)
    res.status(500).json({ error: "Failed to fetch links" })
  }
})

router.get("/:id/stats", async (req, res) => {
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

    const { id } = req.params
    const stats = await LinkModel.getClickStats(id)
    res.status(200).json(stats)
  } catch (error) {
    console.error("Error fetching link stats:", error)
    res.status(500).json({ error: "Failed to fetch link stats" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const link = await LinkModel.getLinkById(id)
    if (!link) {
      res.status(404).json({ error: "Link not found" })
      return
    }
    res.status(200).json(link)
  } catch (error) {
    console.error("Error fetching link:", error)
    res.status(500).json({ error: "Failed to fetch link" })
  }
})

router.post("/", async (req, res) => {
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

    const { title, type = "link", url, body, displayOrder } = req.body
    if (!title) {
      res.status(400).json({ error: "Missing required field: title" })
      return
    }
    if (type === "link" && !url) {
      res.status(400).json({ error: "URL is required for link type" })
      return
    }
    if (type === "text" && !body) {
      res.status(400).json({ error: "Body is required for text type" })
      return
    }

    const link = await LinkModel.createLink(
      title,
      type,
      url,
      body,
      displayOrder || 0,
    )
    res.status(201).json(link)
  } catch (error) {
    console.error("Error creating link:", error)
    res.status(500).json({ error: "Failed to create link" })
  }
})

router.put("/:id", async (req, res) => {
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

    const { id } = req.params
    const link = await LinkModel.updateLink(id, req.body)
    if (!link) {
      res.status(404).json({ error: "Link not found" })
      return
    }
    res.status(200).json(link)
  } catch (error) {
    console.error("Error updating link:", error)
    res.status(500).json({ error: "Failed to update link" })
  }
})

router.delete("/:id", async (req, res) => {
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

    const { id } = req.params
    await LinkModel.deactivateLink(id)
    res.status(200).json({ message: "Link deleted successfully" })
  } catch (error) {
    console.error("Error deleting link:", error)
    res.status(500).json({ error: "Failed to delete link" })
  }
})

router.post("/:id/click", async (req, res) => {
  try {
    const { id } = req.params
    const userAgent = req.headers["user-agent"]
    const ipAddress = req.ip || req.socket.remoteAddress

    const link = await LinkModel.getLinkById(id)
    if (!link) {
      res.status(404).json({ error: "Link not found" })
      return
    }

    await LinkModel.recordClick(id, userAgent, ipAddress)
    res.status(200).json({ message: "Click recorded" })
  } catch (error) {
    console.error("Error recording click:", error)
    res.status(500).json({ error: "Failed to record click" })
  }
})

router.put("/order/update", async (req, res) => {
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

    const { orders } = req.body
    if (!Array.isArray(orders)) {
      res.status(400).json({ error: "Invalid orders format" })
      return
    }

    await LinkModel.updateDisplayOrder(orders)
    res.status(200).json({ message: "Display order updated" })
  } catch (error) {
    console.error("Error updating order:", error)
    res.status(500).json({ error: "Failed to update order" })
  }
})

export default router

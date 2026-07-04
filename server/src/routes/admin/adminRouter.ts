import express from "express"
import communityRouter from "./communityRouter"
import soonRouter from "./soonRouter"
import worshipScheduleRouter from "./worshipSchedule"
import dashboard from "./dashboard"
import permissionRouter from "./permissionRouter"
import { adminBulletinRouter } from "../bulletin"

const router = express.Router()

router.use("/community", communityRouter)
router.use("/soon", soonRouter)
router.use("/worship-schedule", worshipScheduleRouter)
router.use("/dashboard", dashboard)
router.use("/permission", permissionRouter)
router.use("/bulletin", adminBulletinRouter)

export default router

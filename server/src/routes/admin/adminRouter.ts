import express from "express"
import communityRouter from "./communityRouter"
import soonRouter from "./soonRouter"
import worshipScheduleRouter from "./worshipSchedule"
import dashboard from "./dashboard"
import permissionRouter from "./permissionRouter"

const router = express.Router()

router.use("/community", communityRouter)
router.use("/soon", soonRouter)
router.use("/worship-schedule", worshipScheduleRouter)
router.use("/dashboard", dashboard)
router.use("/permission", permissionRouter)

export default router

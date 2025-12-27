import express, { Router } from "express"

import { sharingVideoPath } from "./retreat/sharingRouter"

import authRouter from "./authRouter"
import adminRouter from "./admin/adminRouter"
import retreatRouter from "./retreat/retreatRouter"
import inOutInfoRouter from "./retreat/inOutInfoRouter"
import soonRouter from "./soon/soonRouter"
import eventRouter from "./event"

const router: Router = express.Router()

router.use("/sharing/image", express.static(sharingVideoPath))

router.use("/auth", authRouter)
router.use("/admin", adminRouter)
router.use("/retreat", retreatRouter)
router.use("/in-out-info", inOutInfoRouter)

router.use("/soon", soonRouter)

router.use("/event", eventRouter)

export default router

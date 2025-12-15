import { Router } from "express"
import worshipContestRouter from "./worshipContest"

const router = Router()

router.use("/worship-contest", worshipContestRouter)

export default router

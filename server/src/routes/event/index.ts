import { Router } from "express"
import voteRouter from "./vote"

const router = Router()

router.use("/vote", voteRouter)

export default router

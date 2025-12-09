import express from "express"
import { hasPermission } from "../../../util/util"
import { PermissionType } from "../../../entity/types"
import { retreatAttendDatabase, userDatabase } from "../../../model/dataSource"
const router = express.Router()

router.post("/deposit-processing", async (req, res) => {
  const token = req.header("token")
  if (false === (await hasPermission(token, PermissionType.deposit))) {
    res.sendStatus(401)
    return
  }

  const data = req.body
  const retreatAttendId = data.retreatAttendId
  const isDeposited = data.isDeposited

  const foundRetreatAttend = await retreatAttendDatabase.findOneBy({
    id: retreatAttendId,
  })

  if (!foundRetreatAttend) {
    res.send({ result: "error!" })
    return
  }

  foundRetreatAttend.isDeposited = isDeposited
  await retreatAttendDatabase.save(foundRetreatAttend)
  res.send({ result: "success" })
})

export default router

import { Router } from "express"
import { voteDatabase } from "../../model/dataSource"
import { getUserFromToken } from "../../util"

const router = Router()

type VoteStatus = "투표불가" | "1부" | "2부"

let currentVoteStatus: VoteStatus = "투표불가"

router.get("/status", async (req, res) => {
  res.json({ currentVoteStatus })
})

router.post("/admin/set-status", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user || !user.isSuperUser) {
    res.status(403).json({ message: "권한이 없습니다." })
    return
  }

  const { status } = req.body as { status: VoteStatus }
  currentVoteStatus = status
  res.json({ message: "투표 상태가 변경되었습니다." })
})

router.post("/vote", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ message: "로그인이 필요합니다." })
    return
  }

  if (currentVoteStatus === "투표불가") {
    res.status(403).json({ message: "현재 투표가 불가능한 상태입니다." })
    return
  }

  const existingVote = await voteDatabase.findOne({
    where: {
      voteUser: {
        id: user.id,
      },
      term: currentVoteStatus === "1부" ? 1 : 2,
    },
  })

  if (existingVote) {
    res.status(403).json({ message: "이미 투표하셨습니다." })
    return
  }

  const { firstCommunity, secondCommunity, thirdCommunity } = req.body
  const vote = voteDatabase.create({
    voteUser: user,
    firstCommunity: { id: firstCommunity },
    secondCommunity: { id: secondCommunity },
    thirdCommunity: { id: thirdCommunity },
    term: currentVoteStatus === "1부" ? 1 : 2,
  })
  await voteDatabase.save(vote)

  res.json({ message: "투표가 완료되었습니다." })
})

router.get("/results", async (req, res) => {
  const votes = await voteDatabase.find({
    relations: ["firstCommunity", "secondCommunity", "thirdCommunity"],
  })

  const tally: Record<number, { points: number; name: string }> = {}

  votes.forEach((vote) => {
    if (!tally[vote.firstCommunity.id]) {
      tally[vote.firstCommunity.id] = {
        points: 5,
        name: vote.firstCommunity.name,
      }
    } else {
      tally[vote.firstCommunity.id].points += 5
    }

    if (!tally[vote.secondCommunity.id]) {
      tally[vote.secondCommunity.id] = {
        points: 3,
        name: vote.secondCommunity.name,
      }
    } else {
      tally[vote.secondCommunity.id].points += 3
    }

    if (!tally[vote.thirdCommunity.id]) {
      tally[vote.thirdCommunity.id] = {
        points: 1,
        name: vote.thirdCommunity.name,
      }
    } else {
      tally[vote.thirdCommunity.id].points += 1
    }
  })

  const results = Object.entries(tally)
    .map(([communityId, points]) => ({
      communityId: Number(communityId),
      name: points.name,
      points: points.points,
    }))
    .sort((a, b) => b.points - a.points)

  res.json({ results, totalVotes: votes.length })
})

export default router

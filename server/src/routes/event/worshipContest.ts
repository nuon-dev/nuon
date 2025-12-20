import { Router } from "express"
import {
  communityDatabase,
  worshipContestDatabase,
} from "../../model/dataSource"
import { getUserFromToken } from "../../util/util"
import { IsNull, In } from "typeorm"

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

  const existingVote = await worshipContestDatabase.findOne({
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
  const vote = worshipContestDatabase.create({
    voteUser: user,
    firstCommunity: firstCommunity,
    secondCommunity: secondCommunity,
    thirdCommunity: thirdCommunity,
    term: currentVoteStatus === "1부" ? 1 : 2,
  })
  await worshipContestDatabase.save(vote)

  res.json({ message: "투표가 완료되었습니다." })
})

router.get("/results", async (req, res) => {
  const votes = await worshipContestDatabase.find()

  const tally: Record<number, { points: number; name: string }> = {}

  votes.forEach((vote) => {
    if (!tally[vote.firstCommunity]) {
      tally[vote.firstCommunity] = 5
    } else {
      tally[vote.firstCommunity] += 5
    }

    if (!tally[vote.secondCommunity]) {
      tally[vote.secondCommunity] = 3
    } else {
      tally[vote.secondCommunity] += 3
    }

    if (!tally[vote.thirdCommunity]) {
      tally[vote.thirdCommunity] = 1
    } else {
      tally[vote.thirdCommunity] += 1
    }
  })

  res.json({ result: tally, totalVotes: votes.length })
})

router.get("/my-village", async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) {
    res.status(401).json({ message: "로그인이 필요합니다." })
    return
  }

  const myCommunityId = user.community.id

  const community = await communityDatabase.findOne({
    where: { id: myCommunityId },
    relations: {
      parent: true,
    },
  })

  if (!community) {
    res.status(404).json({ message: "소속된 공동체를 찾을 수 없습니다." })
    return
  }

  res.json({
    communityId: community.parent.id,
    communityName: community.parent.name,
  })
})

export default router

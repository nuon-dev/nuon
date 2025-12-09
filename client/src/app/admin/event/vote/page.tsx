"use client"

import AdminHeader from "@/components/AdminHeader"
import { Button, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import {} from "@server/routes/event/vote"
import { get, post } from "@/config/api"

type VoteStatus = "투표불가" | "1부" | "2부"

export default function VotePage() {
  const [currentState, setCurrentState] = useState<VoteStatus>("투표불가")
  const [results, setResults] = useState<
    { communityId: number; points: number; name: string }[]
  >([])
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    get("/event/vote/status").then((data) => {
      setCurrentState(data.currentVoteStatus)
    })
    fetchResults()
    setInterval(fetchResults, 10 * 1000)
  }, [])

  function handleVoteStatus(newStatus: VoteStatus) {
    post("/event/vote/admin/set-status", { status: newStatus }).then(() => {
      setCurrentState(newStatus)
    })
  }

  function fetchResults() {
    get("/event/vote/results").then((data) => {
      setResults(data.results)
      setTotalVotes(data.totalVotes)
    })
  }

  return (
    <Stack minHeight="100vh">
      <AdminHeader />
      <Stack padding={2} fontSize={24} fontWeight="bold" gap="12px">
        투표 시스템 관리 페이지 <Stack>현재 상태: {currentState}</Stack>
        <Button variant="outlined" onClick={() => handleVoteStatus("1부")}>
          1부 투표 시작
        </Button>
        <Button variant="outlined" onClick={() => handleVoteStatus("2부")}>
          2부 투표 시작
        </Button>
        <Button variant="outlined" onClick={() => handleVoteStatus("투표불가")}>
          투표 종료
        </Button>
        순위 현황
        <Stack>
          총 투표 수: {totalVotes}
          {results.map((result, index) => (
            <Stack key={result.communityId} direction="row" gap="8px">
              <span>
                {index + 1}위 - 공동체 ID: {result.name}
              </span>
              <span>점수: {(result.points / totalVotes).toFixed(2)}</span>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

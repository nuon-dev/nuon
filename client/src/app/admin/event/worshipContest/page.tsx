"use client"

import { Button, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { get, post } from "@/config/api"

type VoteStatus = "투표불가" | "1부 투표" | "2부 투표"

export default function VotePage() {
  const [currentState, setCurrentState] = useState<VoteStatus>("투표불가")
  const [results, setResults] = useState<Record<string, number>>()
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    get("/event/worship-contest/status").then((data) => {
      setCurrentState(data.currentVoteStatus)
    })
    fetchResults()
    setInterval(fetchResults, 10 * 1000)
  }, [])

  function handleVoteStatus(newStatus: VoteStatus) {
    post("/event/worship-contest/admin/set-status", { status: newStatus }).then(
      () => {
        setCurrentState(newStatus)
      }
    )
  }

  function fetchResults() {
    get("/event/worship-contest/results").then((data) => {
      setResults(data.result)
      setTotalVotes(data.totalVotes)
    })
  }

  return (
    <Stack minHeight="100vh">
      <Stack padding={2} fontSize={24} fontWeight="bold" gap="12px">
        투표 시스템 관리 페이지 <Stack>현재 상태: {currentState}</Stack>
        <Button variant="outlined" onClick={() => handleVoteStatus("1부 투표")}>
          1부 투표 시작
        </Button>
        <Button variant="outlined" onClick={() => handleVoteStatus("2부 투표")}>
          2부 투표 시작
        </Button>
        <Button variant="outlined" onClick={() => handleVoteStatus("투표불가")}>
          투표 종료
        </Button>
        순위 현황
        <Stack>
          총 투표 수: {totalVotes}
          {Object.entries(results || {}).map(([communityId, points], index) => (
            <Stack key={communityId} direction="row" gap="8px">
              <span>
                {index + 1}위 : {communityId}
              </span>
              <span>점수: {(points / totalVotes).toFixed(2)}</span>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

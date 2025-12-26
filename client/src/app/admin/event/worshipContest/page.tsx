"use client"

import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { useEffect, useState } from "react"
import { get, post } from "@/config/api"

type VoteStatus = "투표불가" | "1부 투표" | "2부 투표"

export default function VotePage() {
  const [currentState, setCurrentState] = useState<VoteStatus>("투표불가")
  const [results, setResults] =
    useState<Record<string, Record<string, number>>>()
  const [totalVotes, setTotalVotes] = useState(0)
  const [firstTermVotes, setFirstTermVotes] = useState(0)
  const [secondTermVotes, setSecondTermVotes] = useState(0)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    get("/event/worship-contest/status").then((data) => {
      setCurrentState(data.currentVoteStatus)
    })
    fetchResults()
    const interval = setInterval(fetchResults, 10 * 1000)
    return () => clearInterval(interval)
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
      setFirstTermVotes(data.firstTermVoteCount)
      setSecondTermVotes(data.secondTermVoteCount)
      setUserCount(data.userCount)
    })
  }

  function getCommunityRow(
    communityName: string,
    data: Record<string, number> | undefined,
    index: number
  ) {
    if (!data) return null
    const point = calculatePoints(communityName)
    return (
      <TableRow key={communityName}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{communityName}</TableCell>
        <TableCell>{data.first}</TableCell>
        <TableCell>{data.second}</TableCell>
        <TableCell>{data.third}</TableCell>
        <TableCell>{point}</TableCell>
        <TableCell>
          {(
            point / (data.term === 1 ? firstTermVotes : secondTermVotes)
          ).toFixed(4)}
        </TableCell>
      </TableRow>
    )
  }

  function calculatePoints(communityName: string) {
    if (!results) return 0
    if (!results[communityName]) return 0
    const point =
      results[communityName].first * 5 +
      results[communityName].second * 3 +
      results[communityName].third * 1
    return point
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
          유권자수: {userCount} <br />총 투표 수 (1,2부 합산): {totalVotes}
          <br /> 1부 투표 수:
          {firstTermVotes}
          <br /> 2부 투표 수: {secondTermVotes}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>순위</TableCell>
                <TableCell>다락방 이름</TableCell>
                <TableCell>1등 투표 수</TableCell>
                <TableCell>2등 투표 수</TableCell>
                <TableCell>3등 투표 수</TableCell>
                <TableCell>총점</TableCell>
                <TableCell sortDirection="desc">평균</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(results || {})
                .sort(([a], [b]) => calculatePoints(b) - calculatePoints(a))
                .map(([communityId, data], index) =>
                  getCommunityRow(communityId, data, index)
                )}
            </TableBody>
          </Table>
        </Stack>
      </Stack>
    </Stack>
  )
}

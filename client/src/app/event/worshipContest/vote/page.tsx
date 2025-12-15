"use client"

import { useState } from "react"
import axios from "@/config/axios"
import { useEffect } from "react"
import { MenuItem, Select, Stack } from "@mui/material"
import useAuth from "@/hooks/useAuth"
import { Community } from "@server/entity/community"

const 마을들 = [
  "히피",
  "아라스",
  "이레",
  "온유",
  "엘림",
  "포아",
  "리본",
  "올리브",
  "허니로드",
  "하품",
  "하입",
  "크라운",
  "하임",
  "새싹",
  "토브",
  "시하의 숲",
  "두드림",
]

export default function VotePage() {
  const [state, setState] = useState("투표불가")
  const { authUserData, ifNotLoggedGoToLogin } = useAuth()
  const [firstCommunity, setFirstCommunity] = useState("")
  const [secondCommunity, setSecondCommunity] = useState("")
  const [thirdCommunity, setThirdCommunity] = useState("")

  useEffect(() => {
    ifNotLoggedGoToLogin("/event/worshipContest/vote")
    getCurrentStage()
  }, [])

  async function getCurrentStage() {
    const { data } = await axios.get("/event/worship-contest/status")
    setState(data.currentVoteStatus)
  }

  async function submitVote() {
    await axios.post("/event/worship-contest/vote", {
      firstCommunity,
      secondCommunity,
      thirdCommunity,
    })
    alert("투표가 완료되었습니다.")
  }

  return (
    <Stack>
      {state}
      <Stack>각종 안내</Stack>
      <Stack>투표용지 {authUserData?.name}</Stack>
      <Select onChange={(e) => setFirstCommunity(e.target.value as string)}>
        {마을들.map((community) => (
          <MenuItem key={community} value={community}>
            {community}
          </MenuItem>
        ))}
      </Select>
      <Select onChange={(e) => setSecondCommunity(e.target.value as string)}>
        {마을들.map((community) => (
          <MenuItem key={community} value={community}>
            {community}
          </MenuItem>
        ))}
      </Select>
      <Select onChange={(e) => setThirdCommunity(e.target.value as string)}>
        {마을들.map((community) => (
          <MenuItem key={community} value={community}>
            {community}
          </MenuItem>
        ))}
      </Select>
      <button onClick={submitVote}>제출</button>
    </Stack>
  )
}

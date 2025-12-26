"use client"

import { SetStateAction, useState } from "react"
import axios from "@/config/axios"
import { useEffect } from "react"
import { MenuItem, Select, Stack } from "@mui/material"
import useAuth from "@/hooks/useAuth"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import { useRouter } from "next/navigation"
import { CurrentStatus } from "@server/entity/types"

const 마을들: Record<string, string[]> = {
  투표불가: [],
  "1부 투표": [
    "히피 마을",
    "아라스 마을",
    "이레 마을",
    "온유 마을",
    "엘림 마을",
    "포아 마을",
    "리본 마을",
    "올리브 마을",
    "허니로드 마을",
  ],
  "2부 투표": [
    "하품 마을",
    "하입 마을",
    "크라운 마을",
    "하임 마을",
    "새싹 마을",
    "토브 마을",
    "시하의 숲 마을",
    "두드림 마을",
  ],
}

const bgcolor: {
  [key: string]: string
} = {
  투표불가: "#808080",
  "1부 투표": "#74AEB4",
  "2부 투표": "#EFA0AE",
}

const titles: {
  [key: string]: string[]
} = {
  투표불가: ["현재 투표가 불가능합니다."],
  "1부 투표": [
    "1. 히피 : 같이 걸어가기+달리기",
    "2. 아라스 : 사랑을 나눠요",
    "3. 이레 : 나의 사랑하는 책 - 히스플랜",
    "4. 온유 : 기쁜소식+세상 가운데 소망을",
    "5. 엘림 : 레미제라블(뮤지컬곡 개사해서)",
    "6. 포아 : 예수 그의 이름",
    "7. 리본 : 잊지마, christmas!",
    "8. 올리브 : 본향을 향해",
    "9. 허니로드 : 잘 될 거야",
  ],
  "2부 투표": [
    "10. 하품 : bless me - kirk franklin",
    "11. 하입 : 내 눈이 십자가 보니",
    "12. 크라운 : 영원히 함께하자",
    "13. 하임 : 나를 세상의 빛으로+Celebrate the Light",
    "14. 새싹 : 주와 함께 걸어가네",
    "15. 토브 : 위대하신 주",
    "16. 시하의 숲 : 언제나 어떤 상황에서도",
    "17. 두드림 : 사랑하자 - 빨간약",
  ],
}

export default function VotePage() {
  const [state, setState] = useState("투표불가")
  const [myVillage, setMyVillage] = useState("")
  const { authUserData, ifNotLoggedGoToLogin } = useAuth()
  const [firstCommunity, setFirstCommunity] = useState("")
  const [secondCommunity, setSecondCommunity] = useState("")
  const [thirdCommunity, setThirdCommunity] = useState("")
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const { push } = useRouter()

  useEffect(() => {
    ifNotLoggedGoToLogin("/event/worshipContest/vote")
    getCurrentStage()
    getMyVillage()
  }, [])

  async function getCurrentStage() {
    const { data } = await axios.get("/event/worship-contest/status")
    setState(data.currentVoteStatus)
    if (data.currentVoteStatus === "투표불가") {
      setNotificationMessage(`현재 투표가 불가능합니다.`)
      push("/event/worshipContest/main")
    }
  }

  async function getMyVillage() {
    const { data } = await axios.get("/event/worship-contest/my-village")
    setMyVillage(data.communityName)
  }

  async function submitVote() {
    try {
      await axios.post("/event/worship-contest/vote", {
        firstCommunity,
        secondCommunity,
        thirdCommunity,
        state,
      })
      setNotificationMessage("투표가 완료되었습니다.")
    } catch (error) {
      setNotificationMessage(error.response.data.message)
      return
    }
  }

  function villageFilter(community: string, selectedCommunities: string) {
    if (community === selectedCommunities) {
      return true
    }
    if (community === myVillage) {
      return false
    }
    if (community === firstCommunity) {
      return false
    }
    if (community === secondCommunity) {
      return false
    }
    if (community === thirdCommunity) {
      return false
    }
    return true
  }

  function VoteComponent({
    selectedValue,
    setState,
  }: {
    selectedValue: string
    setState: (value: SetStateAction<string>) => void
  }) {
    return (
      <Select value={selectedValue} onChange={(e) => setState(e.target.value)}>
        {마을들[state]
          .filter((community) => villageFilter(community, selectedValue))
          .map((community) => (
            <MenuItem key={community} value={community}>
              {community}
            </MenuItem>
          ))}
      </Select>
    )
  }

  return (
    <Stack
      padding="20px"
      justifyContent="center"
      height="100vh"
      bgcolor={bgcolor[state]}
    >
      <Stack textAlign="center" fontSize="30px" fontWeight="bold">
        {state}
      </Stack>
      <Stack bgcolor="#ccc" p="12px">
        투표방식 <br />
        <ul>
          <li>
            {state === "1부 투표" ? "1" : "2"}부 안에서 1, 2, 3등을
            선택해주세요.
          </li>
          <li>
            {state === "1부 투표" ? "1" : "2"}부 투표시간 이후에는{" "}
            {state === "1부 투표" ? "1" : "2"}부 마을 투표가 불가능 합니다.
          </li>
          <li>자신의 마을에는 투표할 수 없습니다.</li>
        </ul>
        <Stack>
          <Stack>&lt;{state === "1부 투표" ? "1" : "2"}부 공연순서 &gt;</Stack>
          <Stack>
            {titles[state].map((title) => (
              <div key={title}>{title}</div>
            ))}
            <br />
            <br />
          </Stack>
        </Stack>
      </Stack>
      <Stack bgcolor="white" mt="12px" p="12px">
        <Stack textAlign="center">
          투표용지
          <br />
          <Stack>
            {authUserData?.name} ({myVillage})
          </Stack>
        </Stack>
        <Stack gap="12px" mt="12px" justifyContent="center">
          <VoteComponent
            selectedValue={firstCommunity}
            setState={setFirstCommunity}
          />
          <VoteComponent
            selectedValue={secondCommunity}
            setState={setSecondCommunity}
          />
          <VoteComponent
            selectedValue={thirdCommunity}
            setState={setThirdCommunity}
          />
          <button onClick={submitVote}>제출</button>
        </Stack>
      </Stack>
    </Stack>
  )
}

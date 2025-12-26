"use client"

import { SetStateAction, useState } from "react"
import axios from "@/config/axios"
import { useEffect } from "react"
import {
  MenuItem,
  Select,
  Stack,
  Paper,
  Typography,
  Button,
  Avatar,
} from "@mui/material"
import useAuth from "@/hooks/useAuth"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import { useRouter } from "next/navigation"

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
    const confirmed = confirm(
      "제출한 투표는 수정할 수 없습니다. 제출하시겠습니까?"
    )
    if (!confirmed) {
      return
    }
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
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: `linear-gradient(135deg, ${bgcolor[state]} 60%, #fff 100%)`,
        padding: { xs: 1, sm: 3 },
      }}
    >
      {/* 상단 배너 */}
      <Paper
        elevation={6}
        sx={{
          mb: 3,
          px: 4,
          py: 2,
          borderRadius: 3,
          bgcolor: bgcolor[state],
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
          minWidth: "80%",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#fff",
            color: bgcolor[state],
            width: 48,
            height: 48,
            fontWeight: "bold",
            fontSize: 28,
          }}
        >
          🎤
        </Avatar>
        <Typography variant="h4" fontWeight="bold">
          {state}
        </Typography>
      </Paper>

      {/* 안내 카드 */}
      <Paper
        elevation={3}
        sx={{
          mb: 2,
          px: { xs: 2, sm: 4 },
          py: 2,
          borderRadius: 3,
          maxWidth: 480,
          width: "90%",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={1} color="primary">
          투표 안내
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16 }}>
          <li>
            {state === "1부 투표" ? "1" : "2"}부 안에서 1, 2, 3등을
            선택해주세요.
          </li>
          <li>
            {state === "1부 투표" ? "1" : "2"}부 투표시간 이후에는{" "}
            {state === "1부 투표" ? "1" : "2"}부 마을 투표가
            <br /> 불가능합니다.
          </li>
          <li>자신의 마을에는 투표할 수 없습니다.</li>
        </ul>
        <Typography
          variant="subtitle1"
          mt={2}
          fontWeight="bold"
          color="secondary"
        >
          〈{state === "1부 투표" ? "1" : "2"}부 공연순서〉
        </Typography>
        <Stack mt={1} spacing={0.5}>
          {titles[state].map((title) => (
            <Typography key={title} fontSize={15} color="text.secondary">
              {title}
            </Typography>
          ))}
        </Stack>
      </Paper>

      {/* 투표용지 카드 */}
      <Paper
        elevation={4}
        sx={{
          px: { xs: 2, sm: 4 },
          py: 3,
          borderRadius: 3,
          maxWidth: 480,
          width: "90%",
          mt: 1,
        }}
      >
        <Stack alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: bgcolor[state],
              color: "#fff",
              width: 56,
              height: 56,
              fontWeight: "bold",
              fontSize: 24,
              mb: 1,
            }}
          >
            {authUserData?.name?.[0] || "U"}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {authUserData?.name}{" "}
            <span style={{ color: "#888", fontWeight: 400 }}>
              ({myVillage})
            </span>
          </Typography>
        </Stack>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
          투표용지
        </Typography>
        <Stack gap={2} mb={2}>
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
        </Stack>
        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            fontWeight: "bold",
            fontSize: 18,
            borderRadius: 2,
            py: 1.2,
            background:
              state === "1부 투표"
                ? "linear-gradient(90deg, #b3e0f2 0%, #e0f7fa 100%)"
                : state === "2부 투표"
                ? "linear-gradient(90deg, #f8bbd0 0%, #fce4ec 100%)"
                : undefined,
            color: "#444",
            boxShadow:
              state === "1부 투표"
                ? "0 2px 8px rgba(115,174,180,0.10)"
                : state === "2부 투표"
                ? "0 2px 8px rgba(239,160,174,0.10)"
                : undefined,
            "&:hover": {
              background:
                state === "1부 투표"
                  ? "linear-gradient(90deg, #e0f7fa 0%, #b3e0f2 100%)"
                  : state === "2부 투표"
                  ? "linear-gradient(90deg, #fce4ec 0%, #f8bbd0 100%)"
                  : undefined,
              boxShadow:
                state === "1부 투표"
                  ? "0 4px 16px rgba(115,174,180,0.15)"
                  : state === "2부 투표"
                  ? "0 4px 16px rgba(239,160,174,0.15)"
                  : undefined,
            },
          }}
          onClick={submitVote}
        >
          투표 제출
        </Button>
      </Paper>
    </Stack>
  )
}

"use client"

import useAuth from "@/hooks/useAuth"
import { Button, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const titles = [
  "히피 : 같이 걸어가기+달리기",
  "아라스 : 사랑을 나눠요",
  "이레 : 나의 사랑하는 책 - 히스플랜",
  "온유 : 기쁜소식+세상 가운데 소망을",
  "엘림 : 레미제라블(뮤지컬곡 개사해서)",
  "포아 : 예수 그의 이름",
  "리본 : 잊지마, christmas!",
  "올리브 : 본향을 향해",
  "허니로드 : 잘 될 거야",
  "하품 : bless me - kirk franklin",
  "하입 : 내 눈이 십자가 보니",
  "크라운 : 영원히 함께하자",
  "하임 : 나를 세상의 빛으로+Celebrate the Light",
  "새싹 : 주와 함께 걸어가네",
  "토브 : 위대하신 주",
  "시하의 숲 : 언제나 어떤 상황에서도",
  "두드림 : 사랑하자 - 빨간약 ",
]

export default function VotePage() {
  const [] = useState()
  const { push } = useRouter()
  const { ifNotLoggedGoToLogin } = useAuth()

  useEffect(() => {
    ifNotLoggedGoToLogin("/event/worshipContest/vote")
  }, [])

  return (
    <Stack>
      <Stack>
        [공연순서]
        {titles.map((title, index) => `${index + 1}. ${title}`).join("\n")}
      </Stack>
      <Button variant="outlined" onClick={() => push("/event/vote")}>
        투표하러 가기
      </Button>
    </Stack>
  )
}

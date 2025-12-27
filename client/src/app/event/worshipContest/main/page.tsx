"use client"

import useAuth from "@/hooks/useAuth"
import { Stack } from "@mui/material"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VotePage() {
  const [] = useState()
  const { push } = useRouter()
  const { ifNotLoggedGoToLogin } = useAuth()

  useEffect(() => {
    ifNotLoggedGoToLogin("/event/worshipContest/main")
  }, [])

  return (
    <Stack
      bgcolor="black"
      height="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Stack>
        <Image
          src="/event/worshipContest/main_bg.jpeg"
          alt="Worship Contest"
          width={global.innerWidth}
          height={0}
          style={{
            width: "100vw",
            height: "auto",
            position: "relative",
          }}
        />
        <Image
          src="/event/worshipContest/btn.jpeg"
          onClick={() => push("/event/worshipContest/vote")}
          alt="Vote Button"
          width={400}
          height={0}
          style={{
            width: "40vw",
            height: "auto",
            position: "absolute",
            top: "72%",
            left: "30%",
            zIndex: 1,
          }}
        />
      </Stack>
    </Stack>
  )
}

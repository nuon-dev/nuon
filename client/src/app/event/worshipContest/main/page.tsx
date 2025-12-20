"use client"

import useAuth from "@/hooks/useAuth"
import { Stack } from "@mui/material"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import mainBg from "./main_bg.jpeg"
import btn from "./btn.jpeg"

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
          src={mainBg}
          alt="Worship Contest"
          style={{
            width: "100vw",
            height: "auto",
            position: "relative",
          }}
        />
        <Image
          src={btn}
          onClick={() => push("/event/worshipContest/vote")}
          alt="Vote Button"
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

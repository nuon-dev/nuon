"use client"

import { Stack } from "@mui/material"
import { useSearchParams } from "next/navigation"
import useCommunity from "./useCommunity"
import CommunityBoardClient from "./components/CommunityBoardClient"

export default function CommunityHomePage() {
  const searchParams = useSearchParams()

  const slug = searchParams.get("slug")

  if (!slug) {
    return <ErrorSlug />
  }

  const { board } = useCommunity(slug)
  if (!board) {
    return <>게시판 정보를 불러오는 중...</>
  }

  return (
    <div>
      {slug && <div>현재 선택된 커뮤니티: {slug}</div>}
      <CommunityBoardClient boardSlug={slug} />
    </div>
  )
}

function ErrorSlug() {
  return (
    <Stack
      sx={{
        minHeight: "100vh",
        background: "#f8fbff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      존재하지 않는 게시판입니다.
    </Stack>
  )
}

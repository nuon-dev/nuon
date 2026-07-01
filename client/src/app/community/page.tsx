"use client"

import { Stack } from "@mui/material"
import { useRouter, useSearchParams } from "next/navigation"
import useCommunity from "./useCommunity"
import { Suspense } from "react"
import List from "./components/list"

export default function CommunityHomePage() {
  return (
    <Suspense fallback={<div>게시판 정보를 불러오는 중...</div>}>
      <CommunityHomePageContent />
      <WriteButton />
    </Suspense>
  )
}

function CommunityHomePageContent() {
  const searchParams = useSearchParams()

  const slug = searchParams.get("slug")

  if (!slug) {
    return <ErrorSlug />
  }

  const { board } = useCommunity(slug)
  if (!board) {
    return <>게시판 정보를 불러오는 중...</>
  }

  return <div>{board && <List />}</div>
}

function WriteButton() {
  const searchParams = useSearchParams()
  const { push } = useRouter()

  function handleClick() {
    push(`/community/write?slug=${searchParams.get("slug")}`)
  }

  return (
    <Stack
      onClick={handleClick}
      position="fixed"
      bottom="16px"
      right="16px"
      borderRadius="50%"
      width="56px"
      height="56px"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "#1976d2",
        color: "#fff",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        "&:hover": {
          background: "#1565c0",
        },
      }}
    >
      작성
    </Stack>
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

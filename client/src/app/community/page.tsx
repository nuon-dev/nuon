"use client"

import { Fab, Stack, Typography } from "@mui/material"
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

  return (
    <Stack
      minHeight="100dvh"
      bgcolor="grey.50"
      width="100%"
      sx={{ overflowX: "hidden" }}
    >
      <Stack
        width="100%"
        maxWidth={760}
        mx="auto"
        px={2}
        py={2.5}
        minWidth={0}
        sx={{ boxSizing: "border-box" }}
      >
        {board && <List />}
      </Stack>
    </Stack>
  )
}

function WriteButton() {
  const searchParams = useSearchParams()
  const { push } = useRouter()

  function handleClick() {
    push(`/community/write?slug=${searchParams.get("slug")}`)
  }

  return (
    <Fab
      onClick={handleClick}
      variant="extended"
      color="primary"
      aria-label="게시글 작성"
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1200,
        minHeight: 48,
        px: 2,
        borderRadius: 6,
        cursor: "pointer",
        boxShadow: 3,
      }}
    >
      작성
    </Fab>
  )
}

function ErrorSlug() {
  return (
    <Stack
      minHeight="100dvh"
      bgcolor="grey.50"
      alignItems="center"
      justifyContent="center"
      px={2}
      textAlign="center"
    >
      <Typography variant="body1" color="text.secondary">
        존재하지 않는 게시판입니다.
      </Typography>
    </Stack>
  )
}

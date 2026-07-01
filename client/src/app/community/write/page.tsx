"use client"

import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation"
import useCommunity from "../useCommunity"
import { Suspense, useState } from "react"
import { Button, Stack, TextField } from "@mui/material"

export default function CommunityWrite() {
  return (
    <Suspense fallback={<div>게시판 정보를 불러오는 중...</div>}>
      <CommunityWriteContent />
    </Suspense>
  )
}

function CommunityWriteContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const { push } = useRouter()
  const { board, createPost } = useCommunity(slug || "")

  function handleSubmit() {
    createPost(title, content)
    push(`/community?slug=${slug}`)
  }

  if (!board) {
    return <>게시판 정보를 불러오는 중...</>
  }

  return (
    <Stack
      margin="16px"
      sx={{
        background: "#f8fbff",
      }}
      alignItems="center"
    >
      {board?.name} 게시판 글쓰기
      <TextField
        label="제목"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ marginBottom: "16px" }}
      />
      <TextField
        label="내용"
        variant="outlined"
        fullWidth
        multiline
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ marginBottom: "16px" }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        작성
      </Button>
    </Stack>
  )
}

"use client"

import { Button, Stack, TextField } from "@mui/material"
import useCommunity from "../useCommunity"
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation"
import { useState } from "react"

export default function CommunityWrite() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")
  const { push } = useRouter()
  const { board, createPost } = useCommunity(slug || "")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  function handleSubmit() {
    createPost(title, content)
    push(`/community?slug=${slug}`)
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

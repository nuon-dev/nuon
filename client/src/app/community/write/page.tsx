"use client"

import {
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation"
import useCommunity from "../useCommunity"
import { Suspense, useState } from "react"

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

  function handleGoBack() {
    push(`/community?slug=${slug}`)
  }

  function handleSubmit() {
    createPost(title, content)
    push(`/community?slug=${slug}`)
  }

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
        <Paper
          variant="outlined"
          sx={{ borderColor: "grey.200", borderRadius: 2, p: 1.25, mb: 2 }}
        >
          <Stack direction="row" width="100%" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={handleGoBack}
              aria-label="뒤로가기"
              sx={{ color: "text.secondary" }}
            >
              <ArrowBackIosNewRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              textAlign="center"
              variant="subtitle2"
              fontWeight={700}
              noWrap
            >
              {board?.name} 게시판 글쓰기
            </Typography>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ borderColor: "grey.200", borderRadius: 2, p: 2, minWidth: 0 }}
        >
          <Stack gap={1.75}>
            <TextField
              label="제목"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ minWidth: 0 }}
            />
            <TextField
              label="내용"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ minWidth: 0 }}
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                작성
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

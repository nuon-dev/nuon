"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"
import { fetchBoards, createFreePost, createQnaPost } from "../community.api"
import { CommunityBoard } from "../community.types"
import { useNotification } from "@/hooks/useNotification"

type Props = { boardSlug: string }

export default function CommunityWriteClient({ boardSlug }: Props) {
  const router = useRouter()
  const { success, error } = useNotification()
  const [boards, setBoards] = useState<CommunityBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState<CommunityBoard | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    load()
  }, [boardSlug])

  async function load() {
    try {
      setLoading(true)
      const list = await fetchBoards()
      setBoards(list)
      const cur = list.find((b) => b.slug === boardSlug) || null
      setBoard(cur)
    } catch (err) {
      console.error(err)
      error("게시판 정보를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!board) return
    if (!title.trim()) {
      error("제목을 입력해주세요.")
      return
    }
    try {
      setPosting(true)
      if (board.slug.toLowerCase().includes("qna")) {
        await createQnaPost({ boardId: board.id, title: title.trim(), isAnonymous })
      } else {
        if (!content.trim()) {
          error("내용을 입력해주세요.")
          return
        }
        await createFreePost({ boardId: board.id, title: title.trim(), content: content.trim(), isAnonymous })
      }
      success("게시글이 등록되었습니다.")
      router.push(`/community/${encodeURIComponent(board.slug)}`)
    } catch (err) {
      console.error(err)
      error("게시글 등록에 실패했습니다.")
    } finally {
      setPosting(false)
    }
  }

  if (loading) return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}><CircularProgress /></Stack>

  if (!board) return <Box sx={{ p: 2 }}><Typography>게시판을 찾을 수 없습니다.</Typography></Box>

  const isQna = board.slug.toLowerCase().includes("qna")

  return (
    <Box sx={{ minHeight: "60vh", px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Stack spacing={2} sx={{ maxWidth: 980, mx: "auto" }}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Chip label={isQna ? "QnA" : "자유게시판"} />
              <Typography variant="h5" fontWeight={800}>{board.name} — 글쓰기</Typography>
              <Typography color="text.secondary">작성 후 자동으로 게시판으로 이동합니다.</Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField label={isQna ? "질문 제목" : "제목"} value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              {!isQna && (
                <TextField label="내용" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline minRows={6} />
              )}
              <FormControlLabel control={<Switch checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />} label="익명" />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={() => router.push(`/community/${encodeURIComponent(board.slug)}`)} sx={{ borderRadius: 999 }}>취소</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={posting} sx={{ borderRadius: 999 }}>{posting ? "등록 중..." : "등록"}</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

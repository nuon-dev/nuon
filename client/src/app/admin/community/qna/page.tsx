"use client"

import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useTheme } from "@mui/material/styles"
import useAuth from "@/hooks/useAuth"
import { useNotification } from "@/hooks/useNotification"
import {
  answerQnaPost,
  fetchBoards,
  fetchPost,
  fetchPosts,
} from "@/app/community/community.api"
import { CommunityBoard, CommunityPost } from "@/app/community/community.types"

function formatDate(value?: string | null) {
  if (!value) return "-"
  return dayjs(value).format("YYYY.MM.DD HH:mm")
}

function isQnaBoard(board: CommunityBoard) {
  return (
    board.slug.toLowerCase().includes("qna") ||
    board.name.toLowerCase().includes("qna")
  )
}

export default function AdminCommunityQnaPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { isAdminIfNotExit } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [boards, setBoards] = useState<CommunityBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<CommunityBoard | null>(
    null,
  )
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [answer, setAnswer] = useState("")
  const [answerPublic, setAnswerPublic] = useState(false)

  const qnaBoards = useMemo(() => boards.filter(isQnaBoard), [boards])

  useEffect(() => {
    if (!isAdminIfNotExit("/admin/community/qna")) {
      return
    }
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const boardList = await fetchBoards()
      setBoards(boardList)
      const initialBoard = boardList.find(isQnaBoard) || boardList[0] || null
      setSelectedBoard(initialBoard)
      if (initialBoard) {
        const postList = await fetchPosts(initialBoard.id, "qna")
        setPosts(postList)
      } else {
        setPosts([])
      }
    } catch (err) {
      console.error(err)
      error("QnA 데이터를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function selectBoard(board: CommunityBoard) {
    setSelectedBoard(board)
    const postList = await fetchPosts(board.id, "qna")
    setPosts(postList)
  }

  async function openAnswerPanel(post: CommunityPost) {
    try {
      const detail = await fetchPost(post.id)
      setSelectedPost(detail)
      setAnswer(detail.answer || "")
      setAnswerPublic(Boolean(detail.answerPublic))
      setDetailOpen(true)
    } catch (err) {
      console.error(err)
      error("질문 상세를 불러오지 못했습니다.")
    }
  }

  async function handleSaveAnswer() {
    if (!selectedPost) return
    if (!answer.trim()) {
      error("답변을 입력해주세요.")
      return
    }

    try {
      setSaving(true)
      await answerQnaPost({
        postId: selectedPost.id,
        answer: answer.trim(),
        answerPublic,
      })
      const nextDetail = await fetchPost(selectedPost.id)
      setSelectedPost(nextDetail)
      if (selectedBoard) {
        const nextPosts = await fetchPosts(selectedBoard.id, "qna")
        setPosts(nextPosts)
      }
      success("답변이 저장되었습니다.")
    } catch (err) {
      console.error(err)
      error("답변 저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "70vh" }}
      >
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        bgcolor: "#f6f4ff",
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Chip label="ADMIN / QnA 답변" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h4" fontWeight={800}>
                질문 답변 관리
              </Typography>
              <Typography color="text.secondary">
                관리자만 접근할 수 있는 QnA 답변 화면입니다. 게시판을 선택하고
                질문을 눌러 답변을 등록하세요.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {qnaBoards.length === 0 ? (
          <Alert severity="warning">QnA 게시판이 없습니다.</Alert>
        ) : (
          <Stack
            direction="row"
            spacing={1}
            sx={{ overflowX: "auto", pb: 0.5 }}
          >
            {qnaBoards.map((board) => (
              <Chip
                key={board.id}
                label={board.name}
                clickable
                color={selectedBoard?.id === board.id ? "primary" : "default"}
                onClick={() => selectBoard(board)}
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Stack>
        )}

        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={800}>
            질문 목록
          </Typography>

          {posts.length === 0 ? (
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary">
                  질문이 아직 없습니다.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
                onClick={() => openAnswerPanel(post)}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ flex: 1 }}
                      >
                        {post.title || "제목 없음"}
                      </Typography>
                      <Chip
                        label={post.answer ? "답변완료" : "대기중"}
                        color={post.answer ? "success" : "default"}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={
                          post.isAnonymous
                            ? "익명"
                            : post.author?.name || "작성자"
                        }
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={formatDate(post.createdAt)}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      <Dialog
        open={detailOpen}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
        onClose={() => setDetailOpen(false)}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 4 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {!selectedPost ? null : (
            <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={2}
              >
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Chip
                    label="QnA 답변"
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  />
                  <Typography variant="h5" fontWeight={800}>
                    {selectedPost.title || "제목 없음"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedPost.isAnonymous
                      ? "익명"
                      : selectedPost.author?.name || "작성자"}{" "}
                    · {formatDate(selectedPost.createdAt)}
                  </Typography>
                </Stack>
                <IconButton onClick={() => setDetailOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      현재 질문 상태
                    </Typography>
                    <Typography color="text.secondary">
                      답변 공개 여부:{" "}
                      {selectedPost.answerPublic ? "공개" : "비공개"}
                    </Typography>
                    <Typography color="text.secondary">
                      답변 시각: {formatDate(selectedPost.answeredAt)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <TextField
                label="답변"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                multiline
                minRows={6}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={answerPublic}
                    onChange={(e) => setAnswerPublic(e.target.checked)}
                  />
                }
                label="답변 공개"
              />

              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => setDetailOpen(false)}
                  sx={{ borderRadius: 999 }}
                >
                  닫기
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveAnswer}
                  disabled={saving}
                  sx={{ borderRadius: 999 }}
                >
                  {saving ? "저장 중..." : "답변 저장"}
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

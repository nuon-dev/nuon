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
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete"
import { useTheme } from "@mui/material/styles"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import {
  createComment,
  createFreePost,
  createQnaPost,
  fetchBoards,
  fetchComments,
  fetchPost,
  fetchPosts,
  updatePost,
  deletePost,
  deleteComment,
} from "../community.api"
import {
  CommunityBoard,
  CommunityComment,
  CommunityPost,
} from "../community.types"
import useAuth from "@/hooks/useAuth"

type CommunityBoardClientProps = {
  boardSlug: string
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  return dayjs(value).format("YYYY.MM.DD HH:mm")
}

function getBoardMode(slug: string) {
  return slug.toLowerCase().includes("qna") ? "qna" : "free"
}

function getCardBackground(mode: "free" | "qna") {
  return mode === "qna"
    ? "linear-gradient(180deg, rgba(124,77,255,0.12), rgba(124,77,255,0.04))"
    : "linear-gradient(180deg, rgba(25,118,210,0.12), rgba(25,118,210,0.04))"
}

export default function CommunityBoardClient({
  boardSlug,
}: CommunityBoardClientProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { success, error } = useNotification()
  const router = useRouter()
  const [boards, setBoards] = useState<CommunityBoard[]>([])
  const [board, setBoard] = useState<CommunityBoard | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentAnonymous, setCommentAnonymous] = useState(false)
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postAnonymous, setPostAnonymous] = useState(false)
  const { authUserData } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const boardMode = useMemo(
    () => (board ? getBoardMode(board.slug) : "free"),
    [board],
  )

  useEffect(() => {
    loadBoardAndPosts()
  }, [boardSlug])

  async function loadBoardAndPosts() {
    try {
      setLoading(true)
      const boardList = await fetchBoards()
      setBoards(boardList)
      const current = boardList.find((item) => item.slug === boardSlug) || null
      setBoard(current)
      if (current) {
        const postList = await fetchPosts(
          current.id,
          getBoardMode(current.slug),
        )
        setPosts(postList)
      } else {
        setPosts([])
      }
    } catch (err) {
      console.error(err)
      error("게시판을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function refreshPosts(targetBoard?: CommunityBoard | null) {
    const currentBoard = targetBoard ?? board
    if (!currentBoard) return
    const postList = await fetchPosts(
      currentBoard.id,
      getBoardMode(currentBoard.slug),
    )
    setPosts(postList)
  }

  async function openPost(post: CommunityPost) {
    try {
      setDetailLoading(true)
      const [postDetail, commentList] = await Promise.all([
        fetchPost(post.id),
        fetchComments(post.id),
      ])
      setSelectedPost(postDetail)
      setComments(commentList)
      setDetailOpen(true)
      setCommentText("")
      setCommentAnonymous(false)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      error("게시글을 불러오지 못했습니다.")
    } finally {
      setDetailLoading(false)
    }
  }

  function startEdit() {
    if (!selectedPost) return
    setEditTitle(selectedPost.title || "")
    setEditContent(selectedPost.content || "")
    setIsEditing(true)
  }

  async function saveEdit() {
    if (!selectedPost) return
    if (!editTitle.trim()) {
      error("제목을 입력해주세요.")
      return
    }
    try {
      setDetailLoading(true)
      await updatePost(selectedPost.id, {
        title: editTitle.trim(),
        content: editContent?.trim(),
      })
      const updated = await fetchPost(selectedPost.id)
      setSelectedPost(updated)
      await refreshPosts()
      setIsEditing(false)
      success("게시글이 수정되었습니다.")
    } catch (err) {
      console.error(err)
      error("게시글 수정에 실패했습니다.")
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleDeletePost() {
    if (!selectedPost) return
    const ok = confirm("정말로 게시글을 삭제하시겠습니까?")
    if (!ok) return
    try {
      await deletePost(selectedPost.id)
      setDetailOpen(false)
      await refreshPosts()
      success("게시글이 삭제되었습니다.")
    } catch (err) {
      console.error(err)
      error("게시글 삭제에 실패했습니다.")
    }
  }

  async function handleDeleteComment(commentId: string) {
    const ok = confirm("정말로 댓글을 삭제하시겠습니까?")
    if (!ok) return
    try {
      await deleteComment(commentId)
      if (selectedPost) {
        const updated = await fetchComments(selectedPost.id)
        setComments(updated)
      }
      success("댓글이 삭제되었습니다.")
    } catch (err) {
      console.error(err)
      error("댓글 삭제에 실패했습니다.")
    }
  }

  async function handleCreatePost() {
    if (!board) return
    if (!postTitle.trim()) {
      error("제목을 입력해주세요.")
      return
    }

    try {
      setPosting(true)
      if (boardMode === "qna") {
        await createQnaPost({
          boardId: board.id,
          title: postTitle.trim(),
          isAnonymous: postAnonymous,
        })
      } else {
        if (!postContent.trim()) {
          error("내용을 입력해주세요.")
          return
        }
        await createFreePost({
          boardId: board.id,
          title: postTitle.trim(),
          content: postContent.trim(),
          isAnonymous: postAnonymous,
        })
      }

      setPostTitle("")
      setPostContent("")
      setPostAnonymous(false)
      await refreshPosts()
      success("게시글이 등록되었습니다.")
    } catch (err) {
      console.error(err)
      error("게시글 등록에 실패했습니다.")
    } finally {
      setPosting(false)
    }
  }

  async function handleAddComment() {
    if (!selectedPost) return
    if (!commentText.trim()) {
      error("댓글 내용을 입력해주세요.")
      return
    }

    try {
      await createComment({
        postId: selectedPost.id,
        content: commentText.trim(),
        isAnonymous: commentAnonymous,
      })
      setCommentText("")
      setCommentAnonymous(false)
      const updatedComments = await fetchComments(selectedPost.id)
      setComments(updatedComments)
      success("댓글이 등록되었습니다.")
    } catch (err) {
      console.error(err)
      error("댓글 등록에 실패했습니다.")
    }
  }

  const selectedBoardAccent = boardMode === "qna" ? "#7c4dff" : "#1976d2"

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

  if (!board) {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Alert severity="warning">
          해당 게시판을 찾을 수 없습니다. 현재 접근 가능한 게시판:{" "}
          {boards.length}개
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        background:
          boardMode === "qna"
            ? "linear-gradient(180deg, #fbf9ff 0%, #f4f0ff 100%)"
            : "linear-gradient(180deg, #f8fbff 0%, #f3f8ff 100%)",
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 1024, mx: "auto" }}>
        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ height: 8, bgcolor: selectedBoardAccent }} />
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={boardMode === "qna" ? "QnA 게시판" : "자유게시판"}
                  sx={{
                    bgcolor: `${selectedBoardAccent}18`,
                    color: selectedBoardAccent,
                    fontWeight: 700,
                  }}
                />
                <Chip label={board.visibility} variant="outlined" />
              </Stack>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ lineHeight: 1.1 }}
              >
                {board.name}
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {board.description || "게시판 설명이 없습니다."}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{ borderRadius: 4, background: getCardBackground(boardMode) }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={800}>
                  {boardMode === "qna" ? "질문 작성" : "새 글 작성"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="모바일 최적화" size="small" />
                  <Button
                    size="small"
                    onClick={() =>
                      router.push(
                        `/community/${encodeURIComponent(board.slug)}/write`,
                      )
                    }
                    sx={{ textTransform: "none" }}
                  >
                    전용 작성화면
                  </Button>
                </Stack>
              </Stack>

              <TextField
                label={boardMode === "qna" ? "질문 제목" : "제목"}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                fullWidth
              />

              {boardMode === "free" && (
                <TextField
                  label="내용"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                />
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={postAnonymous}
                      onChange={(e) => setPostAnonymous(e.target.checked)}
                    />
                  }
                  label="익명"
                />
                <Button
                  variant="contained"
                  onClick={handleCreatePost}
                  disabled={posting}
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  {posting ? "등록 중..." : "등록하기"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={800}>
            게시글 {posts.length}개
          </Typography>

          {posts.length === 0 ? (
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary">
                  아직 등록된 게시글이 없습니다.
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
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
                  },
                }}
                onClick={() => openPost(post)}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Typography fontWeight={800} sx={{ flex: 1 }}>
                        {post.title || "제목 없음"}
                      </Typography>
                      {post.type === "qna" && (
                        <Chip
                          label={post.answer ? "답변완료" : "답변대기"}
                          color={post.answer ? "success" : "default"}
                          size="small"
                        />
                      )}
                    </Stack>
                    {post.content && boardMode === "free" && (
                      <Typography
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {post.content}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={post.author?.name}
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
          {detailLoading || !selectedPost ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: 280 }}
            >
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                gap={2}
              >
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Chip
                    label={selectedPost.type === "qna" ? "QnA" : "자유게시판"}
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  />
                  {isEditing ? (
                    <TextField
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      fullWidth
                    />
                  ) : (
                    <Typography variant="h5" fontWeight={800}>
                      {selectedPost.title || "제목 없음"}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {selectedPost.author?.name} ·{" "}
                    {formatDate(selectedPost.createdAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {selectedPost &&
                    (selectedPost.author?.id === authUserData?.id ||
                      authUserData?.role?.Admin) && (
                      <>
                        {!isEditing ? (
                          <Button onClick={startEdit} size="small">
                            수정
                          </Button>
                        ) : (
                          <Button
                            onClick={saveEdit}
                            size="small"
                            variant="contained"
                          >
                            저장
                          </Button>
                        )}
                        <IconButton color="error" onClick={handleDeletePost}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  <IconButton onClick={() => setDetailOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider />

              {isEditing ? (
                selectedPost.type === "free" ? (
                  <TextField
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    fullWidth
                    multiline
                    minRows={6}
                  />
                ) : null
              ) : (
                selectedPost.content && (
                  <Box sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {selectedPost.content}
                  </Box>
                )
              )}

              {selectedPost.type === "qna" && (
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        답변
                      </Typography>
                      {selectedPost.answer ? (
                        <>
                          <Typography
                            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                          >
                            {selectedPost.answer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedPost.answeredAt
                              ? `답변 시각: ${formatDate(selectedPost.answeredAt)}`
                              : ""}
                          </Typography>
                        </>
                      ) : (
                        <Typography color="text.secondary">
                          아직 답변이 없습니다.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      댓글 {comments.length}개
                    </Typography>
                    <Stack spacing={1}>
                      {comments.length === 0 ? (
                        <Typography color="text.secondary">
                          댓글이 없습니다.
                        </Typography>
                      ) : (
                        comments.map((comment) => (
                          <Box
                            key={comment.id}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "#f8fafc",
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                gap={1}
                                alignItems="center"
                              >
                                <Stack>
                                  <Typography fontWeight={700} variant="body2">
                                    {comment.author?.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate(comment.createdAt)}
                                  </Typography>
                                </Stack>
                                <Stack>
                                  {(comment.author?.id === authUserData?.id ||
                                    authUserData?.role?.Admin) && (
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Stack>
                              </Stack>
                              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                {comment.content}
                              </Typography>
                            </Stack>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      댓글 작성
                    </Typography>
                    <TextField
                      label="댓글"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={commentAnonymous}
                            onChange={(e) =>
                              setCommentAnonymous(e.target.checked)
                            }
                          />
                        }
                        label="익명"
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddComment}
                        sx={{ borderRadius: 999 }}
                      >
                        댓글 등록
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

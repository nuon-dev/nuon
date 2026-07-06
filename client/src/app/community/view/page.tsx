"use client"

import {
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import MoreVerticalRoundedIcon from "@mui/icons-material/MoreVertRounded"
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation"
import { Suspense, useEffect, useState } from "react"
import { Post } from "@server/entity/community/post"
import { Comment } from "@server/entity/community/comment"
import axios from "@/config/axios"
import dayjs from "dayjs"
import { useNotification } from "@/hooks/useNotification"

export default function ViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostView />
    </Suspense>
  )
}

function PostView() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get("id")
  const { success, error } = useNotification()

  const [commentContent, setCommentContent] = useState("")
  const [post, setPost] = useState<null | Post>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  )

  useEffect(() => {
    fetchPost()
  }, [postId])

  async function fetchPost() {
    if (postId) {
      const { data } = await axios.get(`/community/posts/${postId}`)
      setPost(data)
      const { data: commentsData } = await axios.get(
        `/community/posts/${postId}/comments`,
      )
      setComments(commentsData)
    }
  }

  async function createComment(content: string) {
    if (!postId) return
    try {
      await axios.post(`/community/posts/${postId}/comments`, {
        content,
      })
      fetchPost()
      setCommentContent("")
    } catch (err) {
      console.error(err)
    }
  }

  async function goToBoard() {
    if (!post) return
    push(`/community?slug=${post.board.slug}`)
  }

  function openMoreMenu(event: React.MouseEvent<HTMLElement>) {
    setMoreMenuAnchorEl(event.currentTarget)
  }

  async function handleDeletePost() {
    if (!post) return
    const confirmDelete = window.confirm("정말로 게시글을 삭제하시겠습니까?")
    if (!confirmDelete) return

    try {
      await axios.delete(`/community/posts/${post.id}`)
      success("게시글이 삭제되었습니다.")
      push(`/community?slug=${post.board.slug}`)
    } catch (err) {
      console.error(err)
      error("게시글 삭제에 실패했습니다.\n" + err.message)
    }
  }

  function handleEditPost() {
    if (!post) return
    push(`/community/edit?slug=${post.board.slug}&id=${post.id}`)
  }

  function closeMoreMenu() {
    setMoreMenuAnchorEl(null)
  }

  async function handleSharePost() {
    closeMoreMenu()
    if (!post) return

    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        url,
      })
      return
    }

    await navigator.clipboard.writeText(url)
  }

  if (!post) {
    return <div>Loading...</div>
  }

  return (
    <Stack
      minHeight="100dvh"
      bgcolor="grey.50"
      width="100%"
      sx={{ overflowX: "hidden" }}
    >
      <Stack
        gap={2}
        px={2}
        py={2.5}
        pb={12}
        width="100%"
        maxWidth={760}
        mx="auto"
        minWidth={0}
        sx={{ boxSizing: "border-box" }}
      >
        <Paper
          variant="outlined"
          sx={{ borderColor: "grey.200", borderRadius: 2, p: 1.5, minWidth: 0 }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              size="small"
              onClick={goToBoard}
              aria-label="뒤로가기"
              sx={{ color: "text.secondary" }}
            >
              <ArrowBackIosNewRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" fontWeight={700}>
              {post.board.name}
            </Typography>
            <IconButton
              size="small"
              onClick={openMoreMenu}
              aria-label="더보기"
              sx={{ color: "text.secondary" }}
            >
              <MoreVerticalRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Menu
            anchorEl={moreMenuAnchorEl}
            open={Boolean(moreMenuAnchorEl)}
            onClose={closeMoreMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleEditPost}>수정</MenuItem>
            <MenuItem onClick={handleDeletePost}>삭제</MenuItem>
            <MenuItem onClick={handleSharePost}>공유</MenuItem>
          </Menu>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ borderColor: "grey.200", borderRadius: 2, p: 2, minWidth: 0 }}
        >
          <Stack gap={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              gap={2}
              minWidth={0}
              flexWrap="wrap"
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 0, wordBreak: "break-word" }}
              >
                {post.author.name}{" "}
                {post.author.yearOfBirth !== 0 &&
                  `(${post.author.yearOfBirth})`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
              </Typography>
            </Stack>

            <Typography
              variant="h6"
              fontWeight={700}
              lineHeight={1.35}
              sx={{ wordBreak: "break-word" }}
            >
              {post.title}
            </Typography>

            <Typography
              variant="body1"
              color="text.primary"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {post.content}
            </Typography>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ borderColor: "grey.200", borderRadius: 2, p: 1.5, minWidth: 0 }}
        >
          <Typography variant="subtitle2" fontWeight={700} px={0.5} pb={1}>
            댓글 {comments.length}
          </Typography>

          <Stack divider={<Divider flexItem />} minWidth={0}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                fetchPost={fetchPost}
              />
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Stack
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bgcolor="background.paper"
        borderTop={1}
        borderColor="divider"
        py={1}
        width="100%"
        sx={{ overflowX: "hidden" }}
      >
        <Stack
          direction="row"
          gap={1}
          width="100%"
          maxWidth={760}
          mx="auto"
          px={2}
          alignItems="center"
          minWidth={0}
          sx={{ boxSizing: "border-box" }}
        >
          <TextField
            fullWidth
            placeholder="댓글을 입력하세요"
            variant="outlined"
            size="small"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            sx={{ minWidth: 0 }}
          />
          <Button
            variant="contained"
            onClick={() => createComment(commentContent)}
            sx={{ minWidth: 88, flexShrink: 0 }}
          >
            댓글 작성
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

function CommentItem({
  comment,
  fetchPost,
}: {
  comment: Comment
  fetchPost: () => void
}) {
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  )

  function openMoreMenu(event: React.MouseEvent<HTMLElement>) {
    setMoreMenuAnchorEl(event.currentTarget)
  }

  function closeMoreMenu() {
    setMoreMenuAnchorEl(null)
  }

  async function handleDeletePost() {
    await axios.delete(`/community/comments/${comment.id}`)
    fetchPost()
    closeMoreMenu()
  }

  return (
    <Stack gap={0.75} py={1.25} px={0.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        minWidth={0}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ minWidth: 0, wordBreak: "break-word" }}
        >
          {comment.author.name}{" "}
          {comment.author.yearOfBirth !== 0 &&
            `(${comment.author.yearOfBirth})`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <IconButton
            onClick={openMoreMenu}
            size="small"
            aria-label="더보기"
            sx={{ color: "text.secondary" }}
          >
            <MoreVerticalRoundedIcon fontSize="small" />
          </IconButton>
        </Typography>
      </Stack>

      <Menu
        anchorEl={moreMenuAnchorEl}
        open={Boolean(moreMenuAnchorEl)}
        onClose={closeMoreMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleDeletePost}>삭제</MenuItem>
      </Menu>

      <Typography
        variant="body2"
        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {comment.content}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {dayjs(comment.createdAt).format("YY.MM.DD HH:mm")}
      </Typography>
    </Stack>
  )
}

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
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation"
import { Suspense, useEffect, useState } from "react"
import useCommunity from "../useCommunity"
import { Post } from "@server/entity/community/post"
import { Comment } from "@server/entity/community/comment"
import axios from "@/config/axios"
import dayjs from "dayjs"

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

  const [commentContent, setCommentContent] = useState("")
  const [post, setPost] = useState<null | Post>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] =
    useState<null | HTMLElement>(null)

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
              <MoreHorizRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Menu
            anchorEl={moreMenuAnchorEl}
            open={Boolean(moreMenuAnchorEl)}
            onClose={closeMoreMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={closeMoreMenu}>수정</MenuItem>
            <MenuItem onClick={closeMoreMenu}>삭제</MenuItem>
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
                {post.author.name} ({post.author.yearOfBirth})
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
              <Stack key={comment.id} gap={0.75} py={1.25} px={0.5}>
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
                    {comment.author.name} ({comment.author.yearOfBirth})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    더보기
                  </Typography>
                </Stack>

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

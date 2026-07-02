"use client"

import { Stack, TextField } from "@mui/material"
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

  if (!post) {
    return <div>Loading...</div>
  }

  return (
    <Stack>
      <Stack gap={2} padding={2} marginBottom="56px">
        <Stack
          textAlign="center"
          direction="row"
          justifyContent="space-between"
        >
          <Stack onClick={goToBoard} style={{ cursor: "pointer" }}>
            뒤로가기
          </Stack>
          <Stack>{post.board.name}</Stack>
          <Stack>더보기</Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            {post.author.name} ({post.author.yearOfBirth})
          </Stack>
          <Stack>{dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}</Stack>
        </Stack>
        <Stack fontWeight="bold" fontSize="h6">
          {post.title}
        </Stack>
        <Stack>{post.content}</Stack>
        <Stack gap={1} padding={1} bgcolor="#f5f5f5" borderRadius="4px">
          {comments.map((comment) => (
            <Stack key={comment.id} gap={1} padding={1} borderRadius="4px">
              <Stack direction="row" justifyContent="space-between">
                <Stack fontWeight="bold">
                  {comment.author.name} ({comment.author.yearOfBirth})
                </Stack>
                <Stack>더보기</Stack>
              </Stack>
              <Stack>{comment.content}</Stack>
              <Stack fontSize="small" color="#757575">
                {dayjs(comment.createdAt).format("YY.MM.DD HH:mm")}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack position="fixed" bottom="0px" bgcolor="#fff" width="100%">
        <Stack width="90%" padding={1} direction="row" gap={1}>
          <TextField
            fullWidth
            placeholder="댓글을 입력하세요"
            variant="outlined"
            size="small"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button onClick={() => createComment(commentContent)}>
            댓글 작성
          </button>
        </Stack>
      </Stack>
    </Stack>
  )
}

import axios from "@/config/axios"
import {
  CommunityBoard,
  CommunityComment,
  CommunityPost,
} from "./community.types"

export async function fetchBoards(): Promise<CommunityBoard[]> {
  const { data } = await axios.get("/community/boards")
  return data
}

export async function fetchBoard(boardId: string): Promise<CommunityBoard> {
  const { data } = await axios.get(`/community/boards/${boardId}`)
  return data
}

export async function fetchPosts(
  boardId: string,
  type?: "free" | "qna",
  page = 1,
  limit = 20,
): Promise<CommunityPost[]> {
  const { data } = await axios.get(`/community/boards/${boardId}/posts`, {
    params: { type, page, limit },
  })
  return data
}

export async function fetchPost(postId: string): Promise<CommunityPost> {
  const { data } = await axios.get(`/community/posts/${postId}`)
  return data
}

export async function fetchComments(
  postId: string,
  page = 1,
  limit = 20,
): Promise<CommunityComment[]> {
  const { data } = await axios.get(`/community/posts/${postId}/comments`, {
    params: { page, limit },
  })
  return data
}

export async function createFreePost(input: {
  boardId: string
  title: string
  content: string
  isAnonymous: boolean
}) {
  const { data } = await axios.post(
    `/community/boards/${input.boardId}/free-posts`,
    {
      title: input.title,
      content: input.content,
      isAnonymous: input.isAnonymous,
    },
  )
  return data
}

export async function createQnaPost(input: {
  boardId: string
  title: string
  isAnonymous: boolean
}) {
  const { data } = await axios.post(
    `/community/boards/${input.boardId}/qna-posts`,
    {
      title: input.title,
      isAnonymous: input.isAnonymous,
    },
  )
  return data
}

export async function createComment(input: {
  postId: string
  content: string
  isAnonymous: boolean
}) {
  const { data } = await axios.post(
    `/community/posts/${input.postId}/comments`,
    {
      content: input.content,
      isAnonymous: input.isAnonymous,
    },
  )
  return data
}

export async function answerQnaPost(input: {
  postId: string
  answer: string
  answerPublic: boolean
}) {
  const { data } = await axios.post(
    `/community/qna-posts/${input.postId}/answer`,
    {
      answer: input.answer,
      answerPublic: input.answerPublic,
    },
  )
  return data
}

export async function updatePost(
  postId: string,
  input: { title?: string; content?: string; isAnonymous?: boolean },
) {
  const { data } = await axios.put(`/community/posts/${postId}`, input)
  return data
}

export async function deletePost(postId: string) {
  const { data } = await axios.delete(`/community/posts/${postId}`)
  return data
}

export async function deleteComment(commentId: string) {
  const { data } = await axios.delete(`/community/comments/${commentId}`)
  return data
}

export async function createBoard(input: {
  name: string
  slug: string
  description?: string
  boardType?: "free" | "qna"
}) {
  const { data } = await axios.post(`/community/boards`, input)
  return data
}

export async function deleteBoard(boardId: string) {
  const { data } = await axios.delete(`/community/boards/${boardId}`)
  return data
}

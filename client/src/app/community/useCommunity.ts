"use client"

import axios from "@/config/axios"
import { Board } from "@server/entity/community/board"
import { Post } from "@server/entity/community/post"
import { atom, useAtom } from "jotai"
import { useEffect } from "react"

const boardAtom = atom<Board | null>(null)

const postsAtom = atom([] as Post[])

export default function useCommunity(slug: string) {
  const [board, setBoard] = useAtom<Board | null>(boardAtom)
  const [posts, setPosts] = useAtom(postsAtom)

  useEffect(() => {
    loadBoard()
  }, [slug])

  useEffect(() => {
    loadPosts()
  }, [board])

  async function loadBoard() {
    if (!slug) return
    try {
      const { data } = await axios.get(`/community/boards/${slug}`)
      setBoard(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadPosts() {
    if (!board) return
    try {
      const { data } = await axios.get(`/community/boards/${board.id}/posts`)
      setPosts(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function createPost(title: string, content: string) {
    if (!board) return
    try {
      const { data } = await axios.post(`/community/boards/${board.id}`, {
        title,
        content,
      })
      setPosts((prevPosts) => [...prevPosts, data])
    } catch (err) {
      console.error(err)
    }
  }

  return {
    board,
    posts,
    createPost,
  }
}

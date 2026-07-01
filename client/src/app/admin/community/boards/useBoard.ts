import axios from "@/config/axios"
import { Board } from "@server/entity/community/board"

export default function useBoard() {
  async function fetchBoards(): Promise<Board[]> {
    const { data } = await axios.get("/community/boards")
    return data
  }

  async function fetchBoard(boardId: string): Promise<Board> {
    const { data } = await axios.get(`/community/boards/${boardId}`)
    return data
  }

  async function createBoard(input: {
    name: string
    slug: string
    description?: string
    boardType?: "free" | "qna"
  }) {
    const { data } = await axios.post(`/community/boards`, input)
    return data
  }

  async function deleteBoard(boardId: string) {
    const { data } = await axios.delete(`/community/boards/${boardId}`)
    return data
  }

  return {
    fetchBoards,
    fetchBoard,
    createBoard,
    deleteBoard,
  }
}

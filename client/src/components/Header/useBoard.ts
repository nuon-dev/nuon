import { atom, useAtom } from "jotai"
import axios from "@/config/axios"
import { useEffect } from "react"
import { Board } from "@server/entity/community/board"

const boardAtom = atom<Board[]>([])

export default function useBoard() {
  const [boards, setBoards] = useAtom(boardAtom)

  useEffect(() => {
    if (boards.length === 0) {
      fetchBoards()
    }
  }, [])

  async function fetchBoards() {
    const response = await axios.get("/community/boards")
    setBoards(response.data)
  }

  return { boards }
}

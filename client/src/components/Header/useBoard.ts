import { atom, useAtom } from "jotai"
import axios from "@/config/axios"
import { useEffect } from "react"
import { CommunityBoard } from "@/app/community/community.types"

const boardAtom = atom<CommunityBoard[]>([])

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

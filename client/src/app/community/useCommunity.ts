"use client"

import axios from "@/config/axios"
import { atom, useAtom } from "jotai"
import { useEffect } from "react"

const boardAtom = atom({
  key: "community/board",
  default: null as null | any,
})

export default function useCommunity(slug: string) {
  const [board, setBoard] = useAtom(boardAtom)

  useEffect(() => {
    load()
  }, [slug])

  async function load() {
    try {
      const { data } = await axios.get(`/community/boards/${slug}`)
      setBoard(data)
    } catch (err) {
      console.error(err)
    }
  }

  return {
    board,
  }
}

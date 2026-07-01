"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import useAuth from "@/hooks/useAuth"
import { useNotification } from "@/hooks/useNotification"
import { Board } from "@server/entity/community/board"
import useBoard from "./useBoard"
import BoardComponent from "./board"

export default function AdminCommunityBoardsPage() {
  const { isAdminIfNotExit } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [boards, setBoards] = useState<Board[]>([])

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [boardType, setBoardType] = useState("free")
  const [creating, setCreating] = useState(false)

  const { fetchBoards, createBoard } = useBoard()

  useEffect(() => {
    if (!isAdminIfNotExit("/admin/community/boards")) return
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const list = await fetchBoards()
      setBoards(list)
    } catch (err) {
      error("게시판 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!name.trim() || !slug.trim()) {
      error("이름과 슬러그를 입력하세요.")
      return
    }
    try {
      setCreating(true)
      await createBoard({
        name: name.trim(),
        slug: slug.trim(),
        description: "",
        boardType: boardType as "free" | "qna",
      })
      setName("")
      setSlug("")
      setBoardType("free")
      await load()
      success("게시판이 생성되었습니다.")
    } catch (err: any) {
      console.error(err)
      error(err?.response?.data?.error || "게시판 생성 실패")
    } finally {
      setCreating(false)
    }
  }

  if (loading)
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: 200 }}
      >
        <CircularProgress />
      </Stack>
    )

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Stack spacing={2} sx={{ maxWidth: 980, mx: "auto" }}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight={800}>
                게시판 관리
              </Typography>
              <Typography color="text.secondary">
                관리자가 보드 생성/삭제를 할 수 있습니다.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>유형</InputLabel>
                <Select
                  value={boardType}
                  label="유형"
                  onChange={(e: SelectChangeEvent) =>
                    setBoardType(e.target.value)
                  }
                >
                  <MenuItem value="free">자유 게시판</MenuItem>
                  <MenuItem value="qna">Q&A 게시판</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={creating}
              >
                생성
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={1}>
          {boards.map((b) => (
            <BoardComponent key={b.id} board={b} load={load} />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

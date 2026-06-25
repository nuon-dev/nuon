"use client"

import {
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import { useState } from "react"
import axios from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"
import useBoard from "./useBoard"

export default function Board({
  board,
  load,
}: {
  board: any
  load: () => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(board.name)
  const [slug, setSlug] = useState(board.slug)
  const [boardType, setBoardType] = useState(board.type)
  const { success, error } = useNotification()
  const { deleteBoard } = useBoard()

  async function handleEdit(id: string) {
    setEditing(true)
  }

  async function handleDelete(id: string) {
    const ok = confirm(
      "정말로 게시판을 삭제하시겠습니까? (관련 게시글은 삭제됩니다)",
    )
    if (!ok) return
    try {
      await deleteBoard(id)
      await load()
      success("게시판이 삭제되었습니다.")
    } catch (err) {
      console.error(err)
      error("게시판 삭제 실패")
    }
  }

  async function handleSave(id: string) {
    if (!name.trim() || !slug.trim()) {
      error("이름과 슬러그를 입력하세요.")
      return
    }
    try {
      await axios.put(`/community/boards/${id}`, {
        name,
        slug,
        type: boardType,
      })
      setEditing(false)
      await load()
      success("게시판이 수정되었습니다.")
    } catch (err) {
      console.error(err)
      error("게시판 수정 실패")
    }
  }

  return (
    <Card key={board.id}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            spacing={0.5}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {editing ? (
              <TextField
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <Typography fontWeight={800}>{name}</Typography>
            )}
            {editing ? (
              <TextField
                label="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                {slug} · {board.visibility}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {editing ? (
              <Select
                value={boardType}
                onChange={(e) => setBoardType(e.target.value)}
              >
                <MenuItem value="free">자유 게시판</MenuItem>
                <MenuItem value="qna">Q&A 게시판</MenuItem>
              </Select>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {boardType === "free" ? "자유 게시판" : "Q&A 게시판"}
              </Typography>
            )}
          </Stack>
        </Stack>
        {editing ? (
          <IconButton color="success" onClick={() => handleSave(board.id)}>
            <SaveIcon />
          </IconButton>
        ) : (
          <IconButton color="primary" onClick={() => handleEdit(board.id)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton color="error" onClick={() => handleDelete(board.id)}>
          <DeleteIcon />
        </IconButton>
      </CardContent>
    </Card>
  )
}

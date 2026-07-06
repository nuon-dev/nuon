"use client"

import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import { Post } from "@server/entity/community/post"
import { BoardType } from "@server/entity/community/types"
import EditIcon from "@mui/icons-material/Edit"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"
import dayjs from "dayjs"

interface AnswerItemProps {
  post: Post
  fetchPost?: () => void
}

export default function AnswerItem({ post, fetchPost }: AnswerItemProps) {
  const { authUserData } = useAuth()
  const [answer, setAnswer] = useState("")
  const [answerPublic, setAnswerPublic] = useState(false)
  const [editing, setEditing] = useState(false)

  if (!post) return null
  if (!post.board) return null
  if (post.board.type !== BoardType.QNA) return null

  if (post.qna && post.qna.answer && !editing) {
    return (
      <Paper
        variant="outlined"
        sx={{ borderColor: "grey.200", borderRadius: 2, p: 2, minWidth: 0 }}
      >
        <Stack
          gap={1.75}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {post.qna.answeredBy?.name || "관리자"} 답변
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(post.qna.answeredAt).format("YYYY-MM-DD HH:mm")}
          </Typography>
        </Stack>
        <Stack gap={1}>
          <Typography variant="body2">{post.qna.answer}</Typography>
        </Stack>
        {authUserData?.role.Admin && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                setAnswer(post.qna?.answer || "")
                setAnswerPublic(post.qna?.answerPublic || false)
                setEditing(true)
              }}
            >
              답변 수정
            </Button>
          </Stack>
        )}
      </Paper>
    )
  }

  if (!authUserData?.role.Admin) return null

  async function handleSubmitAnswer() {
    try {
      if (post.qna && post.qna.id) {
        await axios.put(`/community/qna-posts/${post.qna.id}`, {
          answer,
          answerPublic,
        })
      } else {
        await axios.post(`/community/qna-posts/${post.id}/answer`, {
          answer,
          answerPublic,
        })
      }
      alert("답변이 등록되었습니다.")
      editing && setEditing(false)
      fetchPost?.()
    } catch (err) {
      console.error(err)
      alert("답변 등록에 실패했습니다.")
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: "grey.200", borderRadius: 2, p: 2, minWidth: 0 }}
    >
      <Stack gap={1.75}>
        <Typography variant="subtitle2" fontWeight={700}>
          관리자 답변
        </Typography>
        <TextField
          label="답변"
          variant="outlined"
          fullWidth
          multiline
          rows={8}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="답변을 입력하세요"
          sx={{ minWidth: 0 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={answerPublic}
              onChange={(e) => setAnswerPublic(e.target.checked)}
            />
          }
          label={
            <Stack spacing={0.25}>
              <Typography variant="body2" fontWeight={600}>
                질문/답변 공개
              </Typography>
              <Typography variant="caption" color="text.secondary">
                체크하면 답변이 공개됩니다.
              </Typography>
            </Stack>
          }
          sx={{ alignItems: "flex-start", gap: 1, m: 0 }}
        />
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAnswer}
          >
            답변 등록
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

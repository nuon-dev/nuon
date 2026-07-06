import dayjs from "dayjs"
import { useState } from "react"
import axios from "@/config/axios"
import MoreVerticalRoundedIcon from "@mui/icons-material/MoreVertRounded"
import { IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material"
import { Comment } from "@server/entity/community/comment"

export default function CommentItem({
  comment,
  fetchPost,
}: {
  comment: Comment
  fetchPost: () => void
}) {
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  )

  function openMoreMenu(event: React.MouseEvent<HTMLElement>) {
    setMoreMenuAnchorEl(event.currentTarget)
  }

  function closeMoreMenu() {
    setMoreMenuAnchorEl(null)
  }

  async function handleDeletePost() {
    await axios.delete(`/community/comments/${comment.id}`)
    fetchPost()
    closeMoreMenu()
  }

  return (
    <Stack gap={0.75} py={1.25} px={0.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        minWidth={0}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ minWidth: 0, wordBreak: "break-word" }}
        >
          {comment.author.name}{" "}
          {comment.author.yearOfBirth !== 0 &&
            `(${comment.author.yearOfBirth})`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <IconButton
            onClick={openMoreMenu}
            size="small"
            aria-label="더보기"
            sx={{ color: "text.secondary" }}
          >
            <MoreVerticalRoundedIcon fontSize="small" />
          </IconButton>
        </Typography>
      </Stack>

      <Menu
        anchorEl={moreMenuAnchorEl}
        open={Boolean(moreMenuAnchorEl)}
        onClose={closeMoreMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleDeletePost}>삭제</MenuItem>
      </Menu>

      <Typography
        variant="body2"
        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {comment.content}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {dayjs(comment.createdAt).format("YY.MM.DD HH:mm")}
      </Typography>
    </Stack>
  )
}

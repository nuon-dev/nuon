"use client"

import { Box, Stack } from "@mui/material"
import useCommunity from "../useCommunity"
import { Post } from "@server/entity/community/post"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"

export default function CommunityList() {
  const { board, posts } = useCommunity("")
  return (
    <Stack
      width="100%"
      sx={{
        background: "#f8fbff",
        alignItems: "center",
      }}
    >
      <Stack p={2} justifyContent="center" alignItems="center" direction="row">
        {board?.name}
      </Stack>
      <Stack
        width="100%"
        sx={{ background: "#fff" }}
        borderBottom="1px solid #e0e0e0"
      >
        {posts.map((post) => (
          <CommunityPostSection key={post.id} post={post} />
        ))}
      </Stack>
    </Stack>
  )
}

interface CommunityPostSectionProps {
  post: Post
}

export function CommunityPostSection({ post }: CommunityPostSectionProps) {
  const { push } = useRouter()

  function handleClick() {
    push(`/community/view/?id=${post.id}`)
  }

  return (
    <Stack
      display="box"
      flexDirection="column"
      textAlign="left"
      padding="16px"
      borderTop="1px solid #e0e0e0"
      onClick={handleClick}
    >
      <b
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
        }}
      >
        {post.title}
      </b>
      <Stack
        mt="4px"
        sx={{
          display: "-webkit-inline-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
        style={{
          wordWrap: "break-word",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {post.content}
      </Stack>
      <Stack
        mt={1}
        gap={1}
        color="text.secondary"
        direction="row"
        sx={{
          minWidth: 0,
          fontSize: "12px",
          wordBreak: "break-word",
        }}
      >
        <Box>{formatDate(post.createdAt)}</Box>
        <Box>|</Box>
        <Box>{post.author.name} </Box>
      </Stack>
    </Stack>
  )
}

function formatDate(dateString: Date): string {
  const date = dayjs(dateString)
  if (dayjs().diff(date, "hour") === 0) {
    return `${dayjs().diff(date, "minute")}분 전`
  }
  if (dayjs().diff(date, "day") === 0) {
    return `${dayjs().diff(date, "hour")}시간 전`
  }
  if (dayjs().diff(date, "year") === 0) {
    return `${date.format("MM/DD")}`
  }
  return date.format("YYYY-MM-DD")
}

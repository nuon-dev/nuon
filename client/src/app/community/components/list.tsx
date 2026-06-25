"use client"

import { Stack } from "@mui/material"
import useCommunity from "../useCommunity"
import { Post } from "@server/entity/community/post"

interface CommunityListProps {
  slug: string
}

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
  return (
    <Stack
      display="box"
      flexDirection="column"
      textAlign="left"
      padding="16px"
      borderTop="1px solid #e0e0e0"
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
    </Stack>
  )
}

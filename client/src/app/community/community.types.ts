export type CommunityVisibility = "public" | "members" | "private"

export type CommunityUser = {
  id: string
  name?: string | null
}

export type CommunityBoard = {
  id: string
  name: string
  slug: string
  description?: string | null
  visibility: CommunityVisibility
  type: "free" | "qna"
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  createdBy?: CommunityUser | null
  moderators?: CommunityUser[]
}

export type CommunityReaction = {
  id: string
  type: string
  createdAt?: string
  user?: CommunityUser | null
}

export type CommunityComment = {
  id: string
  content: string
  createdAt?: string
  deletedAt?: string | null
  author?: CommunityUser | null
  children?: CommunityComment[]
}

export type CommunityBoardType = "free" | "qna"

export type CommunityPost = {
  id: string
  type: CommunityBoardType
  title?: string | null
  content?: string | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  board: CommunityBoard
  author?: CommunityUser | null
  comments?: CommunityComment[]
  reactions?: CommunityReaction[]
  answer?: string | null
  answerPublic?: boolean
  answeredAt?: string | null
  answeredBy?: CommunityUser | null
}

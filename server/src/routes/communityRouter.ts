import express from "express"
import communityModel from "../model/community"
import { getUserFromToken, hasPermissionFromReq } from "../util/util"
import { PermissionType } from "../entity/types"
import { BoardVisibility } from "../entity/community/board"
import { PostType } from "../entity/community/post"

const router = express.Router()

async function getViewerAccess(req: express.Request) {
  const user = await getUserFromToken(req)
  const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
  const canManageCommunity = await hasPermissionFromReq(
    req,
    PermissionType.communityManage,
  )
  return { user, isAdmin, canManageCommunity }
}

function canAccessBoardVisibility(
  board: {
    visibility: BoardVisibility
    moderators?: Array<{ id: string }>
    createdBy?: { id: string } | null
  },
  user: { id: string } | null,
  isAdmin: boolean,
) {
  if (isAdmin) {
    return true
  }
  if (board.visibility === BoardVisibility.PUBLIC) {
    return true
  }
  if (board.visibility === BoardVisibility.MEMBERS) {
    return !!user
  }
  if (!user) {
    return false
  }

  const isModerator = board.moderators?.some(
    (moderator) => moderator.id === user.id,
  )
  const isCreator = board.createdBy?.id === user.id
  return !!isModerator || isCreator
}

router.get("/boards", async (req, res) => {
  try {
    const { user, isAdmin } = await getViewerAccess(req)
    const boards = await communityModel.listBoards()

    const filteredBoards = boards.filter((board) => {
      if (isAdmin) {
        return true
      }
      return canAccessBoardVisibility(board, user, false)
    })

    res.status(200).json(filteredBoards)
  } catch (error) {
    console.error("Error fetching boards:", error)
    res.status(500).json({ error: "Failed to fetch boards" })
  }
})

router.get("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    res.status(200).json(board)
  } catch (error) {
    console.error("Error fetching board:", error)
    res.status(500).json({ error: "Failed to fetch board" })
  }
})

router.post("/boards", async (req, res) => {
  try {
    const { user, canManageCommunity } = await getViewerAccess(req)
    if (!user || !canManageCommunity) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { name, slug, description, visibility } = req.body
    if (!name || !slug) {
      res.status(400).json({ error: "Missing required fields: name, slug" })
      return
    }

    const board = await communityModel.createBoard({
      name,
      slug,
      description,
      visibility,
      createdBy: user,
    })

    res.status(201).json(board)
  } catch (error) {
    console.error("Error creating board:", error)
    res.status(500).json({ error: "Failed to create board" })
  }
})

router.put("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const { user, canManageCommunity } = await getViewerAccess(req)
    if (!user || !canManageCommunity) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const board = await communityModel.updateBoard(boardId, req.body)
    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    res.status(200).json(board)
  } catch (error) {
    console.error("Error updating board:", error)
    res.status(500).json({ error: "Failed to update board" })
  }
})

router.delete("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const { user, canManageCommunity } = await getViewerAccess(req)
    if (!user || !canManageCommunity) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    await communityModel.deleteBoard(boardId)
    res.status(200).json({ message: "Board deleted successfully" })
  } catch (error) {
    console.error("Error deleting board:", error)
    res.status(500).json({ error: "Failed to delete board" })
  }
})

router.get("/boards/:boardId/posts", async (req, res) => {
  try {
    const { boardId } = req.params
    const { type } = req.query
    const { user, isAdmin } = await getViewerAccess(req)
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const limit = Number(req.query.limit) || 20
    const page = Number(req.query.page) || 1
    const opts = { limit, page }

    if (type === PostType.QNA) {
      const posts = await communityModel.listQnaPosts(boardId, opts)
      res.status(200).json(posts)
      return
    }

    if (type === PostType.FREE) {
      const posts = await communityModel.listFreePosts(boardId, opts)
      res.status(200).json(posts)
      return
    }

    const [freePosts, qnaPosts] = await Promise.all([
      communityModel.listFreePosts(boardId, { ...opts }),
      communityModel.listQnaPosts(boardId, opts),
    ])
    res.status(200).json([...freePosts, ...qnaPosts])
  } catch (error) {
    console.error("Error fetching board posts:", error)
    res.status(500).json({ error: "Failed to fetch board posts" })
  }
})

router.post("/boards/:boardId/free-posts", async (req, res) => {
  try {
    const { boardId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { title, content, isAnonymous } = req.body
    const post = await communityModel.createFreePost({
      boardId,
      author: user,
      title,
      content,
      isAnonymous,
    })

    res.status(201).json(post)
  } catch (error) {
    console.error("Error creating free post:", error)
    res.status(500).json({ error: "Failed to create free post" })
  }
})

router.post("/boards/:boardId/qna-posts", async (req, res) => {
  try {
    const { boardId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { title, isAnonymous } = req.body

    const post = await communityModel.createQnaPost({
      boardId,
      author: user,
      title,
      isAnonymous,
    })

    res.status(201).json(post)
  } catch (error) {
    console.error("Error creating qna post:", error)
    res.status(500).json({ error: "Failed to create qna post" })
  }
})

router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const board = await communityModel.getBoardById(post.board.id)
    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    // Do not include comments in post payload by default (use comments endpoint)
    if (post.type === PostType.QNA) {
      const qnaPost = post as any
      const canSeeAnswer =
        isAdmin ||
        (user && qnaPost.author?.id === user.id) ||
        qnaPost.answerPublic

      if (!canSeeAnswer) {
        qnaPost.answer = null
        qnaPost.answeredBy = null
      }
    }

    res.status(200).json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

// GET paginated top-level comments for a post
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const board = await communityModel.getBoardById(post.board.id)
    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const limit = Number(req.query.limit) || 20
    const page = Number(req.query.page) || 1
    const comments = await communityModel.listComments(postId, { limit, page })
    res.status(200).json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({ error: "Failed to fetch comments" })
  }
})

router.put("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const isOwner = post.author?.id === user.id
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { title, content, isAnonymous } = req.body
    const updateData: {
      title?: string
      content?: string
      isAnonymous?: boolean
    } = {}

    if (title !== undefined) {
      updateData.title = title
    }
    if (content !== undefined) {
      updateData.content = content
    }
    if (isAnonymous !== undefined) {
      updateData.isAnonymous = Boolean(isAnonymous)
    }

    const updated = await communityModel.updatePost(postId, updateData)
    res.status(200).json(updated)
  } catch (error) {
    console.error("Error updating post:", error)
    res.status(500).json({ error: "Failed to update post" })
  }
})

router.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const isOwner = post.author?.id === user.id
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    await communityModel.deletePost(postId)
    res.status(200).json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    res.status(500).json({ error: "Failed to delete post" })
  }
})

router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const board = await communityModel.getBoardById(post.board.id)
    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { content, parentId, isAnonymous } = req.body
    if (!content) {
      res.status(400).json({ error: "Missing required field: content" })
      return
    }

    const comment = await communityModel.createComment({
      postId,
      author: user,
      parentId,
      content,
      isAnonymous,
    })

    res.status(201).json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    res.status(500).json({ error: "Failed to create comment" })
  }
})

router.delete("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const comment = await communityModel.getCommentById(commentId)
    if (!comment) {
      res.status(404).json({ error: "Comment not found" })
      return
    }

    const isOwner = comment.author?.id === user.id
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    await communityModel.deleteComment(commentId)
    res.status(200).json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
})

router.post("/posts/:postId/reactions", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, isAdmin } = await getViewerAccess(req)
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const board = await communityModel.getBoardById(post.board.id)
    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    if (!canAccessBoardVisibility(board, user, isAdmin)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { type = "like" } = req.body
    const result = await communityModel.toggleReaction({
      postId,
      user,
      type,
    })

    res.status(200).json(result)
  } catch (error) {
    console.error("Error toggling reaction:", error)
    res.status(500).json({ error: "Failed to toggle reaction" })
  }
})

router.delete("/posts/:postId/reactions", async (req, res) => {
  try {
    const { postId } = req.params
    const { user } = await getViewerAccess(req)

    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { type = "like" } = req.body
    await communityModel.deleteReaction(postId, user.id, type)
    res.status(200).json({ message: "Reaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting reaction:", error)
    res.status(500).json({ error: "Failed to delete reaction" })
  }
})

router.post("/qna-posts/:postId/answer", async (req, res) => {
  try {
    const { postId } = req.params
    const { user, canManageCommunity } = await getViewerAccess(req)
    if (!user || !canManageCommunity) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const post = await communityModel.getPostById(postId)
    if (!post || post.type !== PostType.QNA) {
      res.status(404).json({ error: "QnA post not found" })
      return
    }

    const { answer, answerPublic } = req.body
    const updated = await communityModel.answerQnaPost(postId, {
      answer,
      answerPublic,
      answeredBy: user,
    })

    if (!updated) {
      res.status(404).json({ error: "QnA post not found" })
      return
    }

    res.status(200).json(updated)
  } catch (error) {
    console.error("Error answering qna post:", error)
    res.status(500).json({ error: "Failed to answer qna post" })
  }
})

export default router

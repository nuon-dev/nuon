import express from "express"
import communityModel from "../model/community"
import { getUserFromToken, hasPermissionFromReq } from "../util/util"
import { PermissionType } from "../entity/types"
import { BoardType } from "../entity/community/board"

const router = express.Router()

router.get("/boards", async (req, res) => {
  try {
    const boards = await communityModel.listBoards()

    res.status(200).json(boards)
  } catch (error) {
    console.error("Error fetching boards:", error)
    res.status(500).json({ error: "Failed to fetch boards" })
  }
})

router.get("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
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
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { name, slug, description, visibility, boardType } = req.body
    if (!name || !slug) {
      res.status(400).json({ error: "Missing required fields: name, slug" })
      return
    }

    const user = await getUserFromToken(req)
    const board = await communityModel.createBoard({
      name,
      slug,
      description,
      visibility,
      boardType,
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
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    const user = await getUserFromToken(req)
    if (!user || !isAdmin) {
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
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!isAdmin) {
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
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    const limit = Number(req.query.limit) || 20
    const page = Number(req.query.page) || 1
    const opts = { limit, page }

    if (type === BoardType.QNA) {
      const user = await getUserFromToken(req)
      const posts = await communityModel.listQnaPosts(boardId, user, opts)
      if (!isAdmin) {
        // 익명 처리
        posts.forEach((each) => {
          each.post.author.name = "익명"
          each.post.author.yearOfBirth = 0
        })
      }
      res.status(200).json(posts)
      return
    }

    if (type === BoardType.FREE) {
      const posts = await communityModel.listFreePosts(boardId, opts)
      res.status(200).json(posts)
      return
    }

    res.status(400).json({ error: "Invalid post type" })
  } catch (error) {
    console.error("Error fetching board posts:", error)
    res.status(500).json({ error: "Failed to fetch board posts" })
  }
})

router.post("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const board = await communityModel.getBoardById(boardId)

    if (!board) {
      res.status(404).json({ error: "Board not found" })
      return
    }

    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { title, content } = req.body
    const post = await communityModel.createFreePost({
      boardId,
      author: user,
      title,
      content,
    })

    res.status(201).json(post)
  } catch (error) {
    console.error("Error creating free post:", error)
    res.status(500).json({ error: "Failed to create free post" })
  }
})

router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
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

    if (board.type === BoardType.FREE) {
      res.status(200).json(post)
      return
    }

    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (isAdmin) {
      res.status(200).json(post)
      return
    }

    if (board.type === BoardType.QNA) {
      post.author.name = "익명"
      post.author.yearOfBirth = 0

      res.status(200).json(post)
      return
    }

    res.status(400).json({ error: "Invalid board type" })
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const limit = Number(req.query.limit) || 20
    const page = Number(req.query.page) || 1
    const comments = await communityModel.listComments(postId, { limit, page })
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (post.board.type === BoardType.QNA && !isAdmin) {
      comments.forEach((comment) => {
        comment.author.name = "익명"
        comment.author.yearOfBirth = 0
      })
    }
    res.status(200).json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({ error: "Failed to fetch comments" })
  }
})

router.put("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const isOwner = post.author?.id === user.id
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { title, content } = req.body
    const updateData: {
      title?: string
      content?: string
    } = {}

    if (title !== undefined) {
      updateData.title = title
    }
    if (content !== undefined) {
      updateData.content = content
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
    const post = await communityModel.getPostById(postId)
    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const isOwner = post.author?.id === user.id
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
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
    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const user = await getUserFromToken(req)
    if (!user) {
      res.status(401).json({ error: "Login required" })
      return
    }

    const { content, parentId } = req.body
    if (!content) {
      res.status(400).json({ error: "Missing required field: content" })
      return
    }

    const comment = await communityModel.createComment({
      postId,
      author: user,
      parentId,
      content,
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

    const user = await getUserFromToken(req)
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
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
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

    const post = await communityModel.getPostById(postId)

    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    const user = await getUserFromToken(req)
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

    const user = await getUserFromToken(req)
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
    const user = await getUserFromToken(req)
    const isAdmin = await hasPermissionFromReq(req, PermissionType.admin)
    if (!user || !isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const post = await communityModel.getPostById(postId)
    if (!post || post.board.type !== BoardType.QNA) {
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

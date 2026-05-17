import { In, IsNull } from "typeorm"
import {
  boardDatabase,
  commentDatabase,
  freePostDatabase,
  postDatabase,
  qnaPostDatabase,
  reactionDatabase,
} from "./dataSource"
import { Board, BoardVisibility } from "../entity/community/board"
import { Comment } from "../entity/community/comment"
import { Post, PostType } from "../entity/community/post"
import { FreePost } from "../entity/community/freePost"
import { QnaPost } from "../entity/community/qnaPost"
import { Reaction } from "../entity/community/reaction"
import { User } from "../entity/user"

export type BoardInput = {
  name: string
  slug: string
  description?: string
  visibility?: BoardVisibility
  settings?: Record<string, any>
  createdBy?: User | null
  moderators?: User[]
}

export type FreePostInput = {
  boardId: string
  author?: User | null
  title?: string
  content?: string
  isAnonymous?: boolean
}

export type QnaPostInput = {
  boardId: string
  author: User
  title?: string
  isAnonymous?: boolean
}

export type CommentInput = {
  postId: string
  author?: User | null
  parentId?: string | null
  content: string
  isAnonymous?: boolean
}

export type ReactionInput = {
  postId: string
  user: User
  type: string
}

const communityModel = {
  async listBoards(): Promise<Board[]> {
    return boardDatabase.find({
      relations: {
        createdBy: true,
        moderators: true,
      },
      order: {
        createdAt: "ASC",
      },
    })
  },

  async listBoardsByVisibility(
    visibility: BoardVisibility[],
  ): Promise<Board[]> {
    if (visibility.length === 0) {
      return []
    }

    return boardDatabase.find({
      where: {
        visibility: visibility.length === 1 ? visibility[0] : In(visibility),
      },
      relations: {
        createdBy: true,
        moderators: true,
      },
      order: {
        createdAt: "ASC",
      },
    })
  },

  async getBoardById(id: string): Promise<Board | null> {
    return boardDatabase.findOne({
      where: { id },
      relations: {
        createdBy: true,
        moderators: true,
      },
    })
  },

  async getBoardBySlug(slug: string): Promise<Board | null> {
    return boardDatabase.findOne({
      where: { slug },
      relations: {
        createdBy: true,
        moderators: true,
      },
    })
  },

  async createBoard(input: BoardInput): Promise<Board> {
    const board = boardDatabase.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      visibility: input.visibility ?? BoardVisibility.PUBLIC,
      settings: input.settings,
      createdBy: input.createdBy ?? null,
      moderators: input.moderators ?? [],
    })
    return boardDatabase.save(board)
  },

  async updateBoard(id: string, data: Partial<Board>): Promise<Board | null> {
    await boardDatabase.update(id, data)
    return this.getBoardById(id)
  },

  async deleteBoard(id: string): Promise<void> {
    await boardDatabase.softDelete(id)
  },

  async listFreePosts(
    boardId: string,
    opts?: { limit?: number; page?: number },
  ): Promise<FreePost[]> {
    const limit = opts?.limit ?? 20
    const page = Math.max((opts?.page ?? 1) - 1, 0)
    return freePostDatabase.find({
      where: {
        board: { id: boardId },
        deletedAt: IsNull(),
      },
      relations: {
        board: true,
        author: true,
        comments: {
          author: true,
        },
        reactions: {
          user: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
      take: limit,
      skip: page * limit,
    })
  },

  async listQnaPosts(
    boardId: string,
    opts?: { limit?: number; page?: number },
  ): Promise<QnaPost[]> {
    const limit = opts?.limit ?? 20
    const page = Math.max((opts?.page ?? 1) - 1, 0)
    return qnaPostDatabase.find({
      where: {
        board: { id: boardId },
        deletedAt: IsNull(),
      },
      relations: {
        board: true,
        author: true,
        answeredBy: true,
        comments: {
          author: true,
        },
        reactions: {
          user: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
      take: limit,
      skip: page * limit,
    })
  },

  async getPostById(id: string): Promise<Post | null> {
    const post = await postDatabase.findOne({
      where: { id },
      relations: {
        board: {
          createdBy: true,
          moderators: true,
        },
        author: true,
        // avoid eager-loading all comments here for performance; use listComments
        // comments: { author: true, children: true },
        reactions: {
          user: true,
        },
      },
    })

    if (!post) {
      return null
    }

    if (post.type === PostType.QNA) {
      const qnaPost = await qnaPostDatabase.findOne({
        where: { id },
        relations: {
          board: {
            createdBy: true,
            moderators: true,
          },
          author: true,
          answeredBy: true,
          comments: {
            author: true,
          },
          reactions: {
            user: true,
          },
        },
      })
      return qnaPost
    }

    const freePost = await freePostDatabase.findOne({
      where: { id },
      relations: {
        board: {
          createdBy: true,
          moderators: true,
        },
        author: true,
        comments: {
          author: true,
        },
        reactions: {
          user: true,
        },
      },
    })
    return freePost
  },

  async createFreePost(input: FreePostInput): Promise<FreePost> {
    const post = freePostDatabase.create({
      board: { id: input.boardId },
      author: input.author ?? null,
      title: input.title,
      content: input.content,
      isAnonymous: input.isAnonymous ?? false,
    })
    return freePostDatabase.save(post)
  },

  async createQnaPost(input: QnaPostInput): Promise<QnaPost> {
    const post = qnaPostDatabase.create({
      board: { id: input.boardId },
      author: input.author,
      title: input.title,
      isAnonymous: input.isAnonymous ?? false,
    })
    return qnaPostDatabase.save(post)
  },

  async updatePost(
    id: string,
    data: Partial<Pick<Post, "title" | "content" | "isAnonymous">>,
  ): Promise<Post | null> {
    await postDatabase.update(id, data)
    return this.getPostById(id)
  },

  async deletePost(id: string): Promise<void> {
    await postDatabase.softDelete(id)
  },

  async createComment(input: CommentInput): Promise<Comment> {
    const comment = commentDatabase.create({
      post: { id: input.postId },
      parent: input.parentId ? ({ id: input.parentId } as Comment) : null,
      author: input.author ?? null,
      content: input.content,
      isAnonymous: input.isAnonymous ?? false,
    })
    return commentDatabase.save(comment)
  },

  async listComments(
    postId: string,
    opts?: { limit?: number; page?: number },
  ): Promise<Comment[]> {
    const limit = opts?.limit ?? 20
    const page = Math.max((opts?.page ?? 1) - 1, 0)
    return commentDatabase.find({
      where: {
        post: { id: postId },
        parent: IsNull(),
        deletedAt: IsNull(),
      },
      relations: {
        author: true,
        children: {
          author: true,
        },
      },
      order: {
        createdAt: "ASC",
      },
      take: limit,
      skip: page * limit,
    })
  },

  async getCommentById(id: string): Promise<Comment | null> {
    return commentDatabase.findOne({
      where: { id },
      relations: {
        post: {
          board: true,
          author: true,
        },
        parent: true,
        author: true,
        children: true,
      },
    })
  },

  async deleteComment(id: string): Promise<void> {
    await commentDatabase.softDelete(id)
  },

  async answerQnaPost(
    id: string,
    data: {
      answer?: string | null
      answerPublic?: boolean
      answeredBy?: User | null
    },
  ): Promise<QnaPost | null> {
    const qnaPost = await qnaPostDatabase.findOne({
      where: { id },
      relations: {
        board: true,
        author: true,
        answeredBy: true,
        comments: {
          author: true,
        },
        reactions: {
          user: true,
        },
      },
    })

    if (!qnaPost) {
      return null
    }

    if (data.answer !== undefined) {
      qnaPost.answer = data.answer
      qnaPost.answeredAt = data.answer ? new Date() : null
    }
    if (data.answerPublic !== undefined) {
      qnaPost.answerPublic = data.answerPublic
    }
    if (data.answeredBy !== undefined) {
      qnaPost.answeredBy = data.answeredBy
      if (data.answeredBy && !qnaPost.answeredAt) {
        qnaPost.answeredAt = new Date()
      }
    }

    return qnaPostDatabase.save(qnaPost)
  },

  async createReaction(input: ReactionInput): Promise<Reaction> {
    const reaction = reactionDatabase.create({
      post: { id: input.postId },
      user: input.user,
      type: input.type,
    })
    return reactionDatabase.save(reaction)
  },

  async deleteReaction(
    postId: string,
    userId: string,
    type: string,
  ): Promise<void> {
    const reaction = await reactionDatabase.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
        type,
      },
    })

    if (reaction) {
      await reactionDatabase.delete(reaction.id)
    }
  },

  async toggleReaction(input: ReactionInput): Promise<{ created: boolean }> {
    const foundReaction = await reactionDatabase.findOne({
      where: {
        post: { id: input.postId },
        user: { id: input.user.id },
        type: input.type,
      },
    })

    if (foundReaction) {
      await reactionDatabase.delete(foundReaction.id)
      return { created: false }
    }

    await this.createReaction(input)
    return { created: true }
  },
}

export default communityModel

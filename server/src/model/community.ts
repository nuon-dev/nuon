import { In, IsNull } from "typeorm"
import {
  boardDatabase,
  commentDatabase,
  postDatabase,
  qnaPostDatabase,
  reactionDatabase,
} from "./dataSource"
import { Board, BoardType, BoardVisibility } from "../entity/community/board"
import { Comment } from "../entity/community/comment"
import { Post } from "../entity/community/post"
import { QnaPost } from "../entity/community/qnaPost"
import { Reaction } from "../entity/community/reaction"
import { User } from "../entity/user"

export type BoardInput = {
  name: string
  slug: string
  description?: string
  visibility?: BoardVisibility
  boardType?: BoardType
  createdBy?: User | null
  moderators?: User[]
}

export type FreePostInput = {
  boardId: string
  author: User
  title?: string
  content?: string
}

export type CommentInput = {
  postId: string
  author: User
  parentId?: string | null
  content: string
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
      },
      order: {
        createdAt: "ASC",
      },
    })
  },

  async getBoardBySlug(slug: string): Promise<Board | null> {
    return boardDatabase.findOne({
      where: { slug },
    })
  },

  async getBoardById(id: string): Promise<Board | null> {
    return boardDatabase.findOne({
      where: { id },
      relations: {
        createdBy: true,
        posts: true,
      },
    })
  },

  async createBoard(input: BoardInput): Promise<Board> {
    const board = boardDatabase.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      visibility: input.visibility ?? BoardVisibility.PUBLIC,
      createdBy: input.createdBy ?? null,
      type: input.boardType ?? BoardType.FREE,
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
  ): Promise<Post[]> {
    const board = await boardDatabase.findOne({ where: { id: boardId } })
    if (!board) {
      throw new Error("Board not found")
    }

    const limit = opts?.limit ?? 20
    const page = Math.max((opts?.page ?? 1) - 1, 0)
    return postDatabase.find({
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
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        board: {
          id: true,
          name: true,
          slug: true,
        },
        author: {
          id: true,
          name: true,
        },
        comments: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            id: true,
            name: true,
          },
        },
        reactions: {
          id: true,
          type: true,
          user: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: page * limit,
    })
  },

  async listQnaPosts(
    boardId: string,
    user: User | null,
    opts?: { limit?: number; page?: number },
  ): Promise<QnaPost[]> {
    const limit = opts?.limit ?? 20
    const page = Math.max((opts?.page ?? 1) - 1, 0)

    const baseWhere = {
      board: { id: boardId },
      deletedAt: IsNull(),
    }

    // user 존재 여부에 따른 OR 조건 분기
    const whereCondition = user
      ? [
          {
            post: { ...baseWhere, author: { id: user.id } },
          },
          {
            post: baseWhere,
            answerPublic: true,
          },
        ]
      : {
          post: baseWhere,
          answerPublic: true,
        }

    return qnaPostDatabase.find({
      where: whereCondition,
      relations: {
        post: {
          board: true,
          author: true,
          reactions: {
            user: true,
          },
        },
        answeredBy: true,
      },
      order: {
        post: {
          createdAt: "DESC",
        },
      },
      select: {
        id: true,
        answer: true,
        answerPublic: true,
        answeredAt: true,
        post: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          board: {
            id: true,
            name: true,
            slug: true,
          },
          author: {
            id: true,
            name: true,
            yearOfBirth: true,
          },
        },
        answeredBy: {
          id: true,
          name: true,
        },
      },
      take: limit,
      skip: page * limit,
    })
  },

  async getPostById(id: string): Promise<Post | null> {
    const post = await postDatabase.findOne({
      where: { id },
      relations: {
        board: true,
        author: true,
        reactions: {
          user: true,
        },
        qna: true,
      },
    })

    if (!post) {
      return null
    }

    return post
  },

  async createFreePost(input: FreePostInput): Promise<Post> {
    const post = postDatabase.create({
      board: { id: input.boardId },
      author: input.author,
      title: input.title,
      content: input.content,
    })
    return postDatabase.save(post)
  },

  async updatePost(
    id: string,
    data: Partial<Pick<Post, "title" | "content">>,
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
      author: input.author,
      content: input.content,
    })
    return commentDatabase.save(comment)
  },
  /////////////////////////// 여기 상위로 함수들은 확인 됨

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
      where: { post: { id } },
      relations: {
        answeredBy: true,
        post: {
          board: true,
          author: true,
          comments: {
            author: true,
          },
          reactions: {
            user: true,
          },
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

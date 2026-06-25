import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  VirtualColumn,
} from "typeorm"
import { User } from "../user"
import { Board } from "./board"
import { Comment } from "./comment"
import { Reaction } from "./reaction"
import { QnaPost } from "./qnaPost"

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => User, { nullable: false })
  author!: User

  @ManyToOne(() => Board, (board) => board.posts, { nullable: false })
  board!: Board

  @Column({ nullable: true, comment: "게시글 제목" })
  title?: string

  @Column({ type: "text", nullable: true, comment: "게시글 본문" })
  content?: string

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: ["insert", "update"],
  })
  comments!: Comment[]

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM comment WHERE comment.postId = ${alias}.id`,
  })
  commentCount!: number

  @OneToMany(() => Reaction, (reaction) => reaction.post, {
    cascade: ["insert", "update"],
  })
  reactions?: Reaction[]

  @OneToOne(() => QnaPost, (qna: QnaPost) => qna.post, { nullable: true })
  qna?: QnaPost

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  updatedAt!: Date

  @DeleteDateColumn({
    type: "timestamp",
    nullable: true,
    comment: "소프트 삭제 시각",
  })
  deletedAt?: Date | null
}

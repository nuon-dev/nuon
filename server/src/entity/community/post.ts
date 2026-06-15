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
} from "typeorm"
import { User } from "../user"
import { Board } from "./board"
import { Comment } from "./comment"
import { Reaction } from "./reaction"
import { QnaPost } from "./qnaPost"

export enum PostType {
  FREE = "free",
  QNA = "qna",
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 50, comment: "게시글 타입" })
  type!: PostType

  @ManyToOne(() => User, { nullable: false })
  author?: User

  @ManyToOne(() => Board, (board) => board.posts, { nullable: false })
  board!: Board

  @Column({ nullable: true, comment: "게시글 제목" })
  title?: string

  @Column({ type: "text", nullable: true, comment: "게시글 본문" })
  content?: string

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: ["insert", "update"],
  })
  comments?: Comment[]

  @OneToMany(() => Reaction, (reaction) => reaction.post, {
    cascade: ["insert", "update"],
  })
  reactions?: Reaction[]

  @OneToOne(() => QnaPost, (qna) => qna.post, { nullable: true })
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

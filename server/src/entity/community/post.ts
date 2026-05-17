import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  TableInheritance,
} from "typeorm"
import { User } from "../user"
import { Board } from "./board"
import { Comment } from "./comment"
import { Reaction } from "./reaction"

export enum PostType {
  FREE = "free",
  QNA = "qna",
}

@Entity()
@TableInheritance({
  column: { type: "varchar", name: "type", default: PostType.FREE },
})
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 50, comment: "게시글 타입" })
  type!: PostType

  @ManyToOne(() => User, { nullable: true })
  author?: User | null

  @ManyToOne(() => Board, (board) => board.posts, { nullable: false })
  board!: Board

  @Column({ nullable: true, comment: "게시글 제목" })
  title?: string

  @Column({ type: "text", nullable: true, comment: "게시글 본문" })
  content?: string

  @Column({ default: false, comment: "익명 작성 여부" })
  isAnonymous!: boolean

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: ["insert", "update"],
  })
  comments?: Comment[]

  @OneToMany(() => Reaction, (reaction) => reaction.post, {
    cascade: ["insert", "update"],
  })
  reactions?: Reaction[]

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

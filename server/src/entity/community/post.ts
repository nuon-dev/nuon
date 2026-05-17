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

  @Column({ type: "varchar", length: 50 })
  type!: PostType

  @ManyToOne(() => User, { nullable: true })
  author?: User | null

  @ManyToOne(() => Board, (board) => board.posts, { nullable: false })
  board!: Board

  @Column({ nullable: true })
  title?: string

  @Column({ type: "text", nullable: true })
  content?: string

  @Column({ default: false })
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

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt?: Date | null
}

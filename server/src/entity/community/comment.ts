import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm"
import { Post } from "./post"
import { User } from "../user"

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post!: Post

  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
  })
  parent?: Comment | null

  @OneToMany(() => Comment, (comment) => comment.parent)
  children?: Comment[]

  @ManyToOne(() => User, { nullable: true })
  author?: User | null

  @Column({ type: "text" })
  content!: string

  @Column({ default: false })
  isAnonymous!: boolean

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt?: Date | null
}

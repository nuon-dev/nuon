import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from "typeorm"
import { Post } from "./post"
import { User } from "../user"

@Entity()
@Index(["post", "user", "type"], { unique: true })
export class Reaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Post, (post) => post.reactions, { nullable: false })
  post!: Post

  @ManyToOne(() => User, { nullable: false })
  user!: User

  @Column({ comment: "반응 타입" })
  type!: string

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date
}

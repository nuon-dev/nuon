import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "../user"
import { Post } from "./post"

@Entity()
export class QnaPost {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @OneToOne(() => Post, (post: Post) => post.qna, { nullable: false })
  @JoinColumn({ name: "postId" })
  post!: Post

  // Admin's answer
  @Column({ type: "text", nullable: true, comment: "관리자 답변" })
  answer?: string | null

  @ManyToOne(() => User, { nullable: true })
  answeredBy?: User | null

  @Column({ type: "timestamp", nullable: true, comment: "답변 완료 시각" })
  answeredAt?: Date | null

  // If true, answer is visible to everyone; otherwise only to the asker and admins
  @Column({ default: false, comment: "답변 공개 여부" })
  answerPublic!: boolean
}

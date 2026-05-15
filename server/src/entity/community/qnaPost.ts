import { ChildEntity, Column, ManyToOne } from "typeorm"
import { User } from "../user"
import { Post, PostType } from "./post"

@ChildEntity(PostType.QNA)
export class QnaPost extends Post {
  // Admin's answer
  @Column({ type: "text", nullable: true })
  answer?: string | null

  @ManyToOne(() => User, { nullable: true })
  answeredBy?: User | null

  // If true, answer is visible to everyone; otherwise only to the asker and admins
  @Column({ default: false })
  answerPublic!: boolean
}

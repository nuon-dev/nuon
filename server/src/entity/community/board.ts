import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from "typeorm"
import { User } from "../user"
import { Post } from "./post"

export enum BoardVisibility {
  PUBLIC = "public",
  MEMBERS = "members",
  PRIVATE = "private",
}

export enum BoardType {
  FREE = "free",
  QNA = "qna",
}

@Entity()
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ comment: "게시판 이름" })
  name!: string

  @Column({ unique: true, comment: "게시판 고유 식별용 slug" })
  slug!: string

  @Column({ nullable: true, type: "text", comment: "게시판 설명" })
  description?: string

  @Column({
    type: "enum",
    enum: BoardVisibility,
    default: BoardVisibility.PUBLIC,
    comment: "게시판 공개 범위",
  })
  visibility!: BoardVisibility

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User | null

  @Column({
    type: "enum",
    enum: BoardType,
    default: BoardType.FREE,
    comment: "게시판 유형",
  })
  type!: BoardType

  @OneToMany(() => Post, (post) => post.board)
  posts?: Post[]

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

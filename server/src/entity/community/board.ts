import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from "typeorm"
import { User } from "../user"

export enum BoardVisibility {
  PUBLIC = "public",
  MEMBERS = "members",
  PRIVATE = "private",
}

@Entity()
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ nullable: true, type: "text" })
  description?: string

  @Column({
    type: "enum",
    enum: BoardVisibility,
    default: BoardVisibility.PUBLIC,
  })
  visibility!: BoardVisibility

  // Flexible JSON settings for custom fields, templates, or admin flags
  @Column({ type: "json", nullable: true })
  settings?: Record<string, any>

  @ManyToMany(() => User, { nullable: true })
  @JoinTable({ name: "board_moderators" })
  moderators?: User[]

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User | null

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
}

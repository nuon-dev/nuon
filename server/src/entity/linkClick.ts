import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Link } from "./link"

@Entity()
export class LinkClick {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Link, (link) => link.clicks, {
    onDelete: "CASCADE",
  })
  link!: Link

  @Column({ type: "varchar", length: 500, nullable: true })
  userAgent!: string

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  clickedAt!: Date
}

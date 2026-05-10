import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { LinkClick } from "./linkClick"

export enum LinkType {
  LINK = "link",
  TEXT = "text",
}

@Entity()
export class Link {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  title!: string

  @Column({ type: "enum", enum: LinkType, default: LinkType.LINK })
  type!: LinkType

  @Column({ nullable: true })
  url?: string

  @Column({ type: "text", nullable: true })
  body?: string

  @Column({ type: "int", default: 0 })
  displayOrder!: number

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @OneToMany(() => LinkClick, (click) => click.link, {
    cascade: ["insert", "update"],
  })
  clicks!: LinkClick[]

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

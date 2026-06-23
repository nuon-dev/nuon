import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "../user"

@Entity()
export class SharingText {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User)
  writer!: User

  @Column({ type: "text" })
  content!: string

  @Column({ default: true })
  visible!: boolean

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date
}

@Entity()
export class SharingImage {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User)
  writer!: User

  @Column({ type: "text" })
  url!: string

  @Column({ default: true })
  visible!: boolean

  @Column({ type: "text", nullable: true })
  tags!: string

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date
}

@Entity()
export class SharingVideo {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User)
  writer!: User

  @Column({ type: "text" })
  url!: string

  @Column({ default: true })
  visible!: boolean

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date
}

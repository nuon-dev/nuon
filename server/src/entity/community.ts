import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "./user"

@Entity()
export class Community {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Community, (community) => community.children, {
    nullable: true,
  })
  parent!: Community | null

  @OneToMany(() => Community, (community) => community.parent)
  children!: Community[]

  @Column()
  name!: string

  @OneToMany(() => User, (user) => user.community)
  users!: User[]

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: string

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  lastModifiedAt!: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "leaderId" })
  leader!: User | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "deputyLeaderId" })
  deputyLeader!: User | null

  @Column({ default: 0 })
  x!: number

  @Column({ default: 0 })
  y!: number
}

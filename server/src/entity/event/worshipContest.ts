import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm"
import { User } from "../user"

@Entity()
export class WorshipContest {
  @PrimaryGeneratedColumn()
  id: number

  @JoinColumn({ name: "voteUserId" })
  @ManyToOne(() => User, (user) => user.id)
  voteUser: User

  @Column()
  firstCommunity: string

  @Column()
  secondCommunity: string

  @Column()
  thirdCommunity: string

  @Column()
  term: number

  @CreateDateColumn()
  createdAt: Date
}

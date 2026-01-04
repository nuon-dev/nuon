import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "../user"
import { InOutInfo } from "./inOutInfo"
import { CurrentStatus, Deposit, HowToMove } from "../types"

@Entity()
export class RetreatAttend {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => User, (user) => user.retreatAttend)
  @JoinColumn()
  user: User

  @Column({ default: 0 })
  groupNumber: number

  @Column({ nullable: true })
  roomNumber: number

  @Column({ type: "text", nullable: true })
  memo: string

  @Column({ default: Deposit.none })
  isDeposited: Deposit

  @Column({ nullable: true })
  howToGo: HowToMove

  @Column({ nullable: true })
  howToBack: HowToMove

  @Column({ default: false })
  isCanceled: boolean

  @Column({ nullable: true })
  etc: string

  @Column({ default: CurrentStatus.null })
  currentStatus: CurrentStatus

  @Column({ default: 0 })
  attendanceNumber: number

  @Column({ type: "text", nullable: true })
  postcardContent: string

  @OneToMany(() => InOutInfo, (inOutInfo) => inOutInfo.retreatAttend)
  inOutInfos: InOutInfo[]

  @Column({ default: true })
  isWorker: boolean

  @Column({ default: false })
  isHalf: boolean

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt: Date
}

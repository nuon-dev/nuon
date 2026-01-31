import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "../user"
import { Community } from "../community"
import { NewcomerStatus } from "../types"
import { NewcomerEducation } from "./newcomerEducation"
import { NewcomerManager } from "./newcomerManager"

@Entity()
export class Newcomer {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  yearOfBirth: number

  @Column({ nullable: true })
  gender: "man" | "woman" | ""

  @Column({ nullable: true })
  phone: string // 연락처

  @ManyToOne(() => User)
  @JoinColumn({ name: "guiderId" })
  guider: User // 인도자

  @Column({
    type: "enum",
    enum: NewcomerStatus,
    default: NewcomerStatus.NORMAL,
  })
  status: NewcomerStatus

  @Column({ nullable: true })
  promotionDate: string // 등반일

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: "assignmentId" })
  assignment: Community // 배정 (등반 후 배정받는 순)

  @Column({ nullable: true })
  pendingDate: string // 보류일

  @ManyToOne(() => NewcomerManager)
  @JoinColumn({ name: "newcomerManagerId" })
  newcomerManager: NewcomerManager // 섬김이(담당자)

  @OneToMany(() => NewcomerEducation, (education) => education.newcomer)
  educationRecords: NewcomerEducation[]

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt: Date

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updatedAt: Date

  @DeleteDateColumn({
    type: "timestamp",
    nullable: true,
  })
  deletedAt: Date | null // 삭제일
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "./user"
import { NewcomerStatus } from "./types"
import { NewcomerEducation } from "./newcomerEducation"

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

  @Column({ nullable: true })
  assignment: string // 배정

  @Column({ nullable: true })
  deletionDate: string // 삭제일

  @Column({ nullable: true })
  pendingDate: string // 보류일

  @ManyToOne(() => User)
  @JoinColumn({ name: "managerId" })
  manager: User

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
}

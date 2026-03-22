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
import { NewcomerStatus, FaithLevel } from "../types"
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

  @Column({ nullable: true })
  address: string // 주소

  @Column({ nullable: true })
  occupation: string // 신분(학생-학교/전공, 대학원생-학교/전공, 취업준비-준비계열/분야, 직장인-계열/분야)

  @Column({ nullable: true })
  visitPath: string // 방문경로

  @Column({ nullable: true })
  registrationMotivation: string // 등록계기

  @Column({
    type: "enum",
    enum: FaithLevel,
    nullable: true,
  })
  faithLevel: FaithLevel // 신앙생활(초신자, 세례, 입교, 학습)

  @Column({ nullable: true })
  previousChurch: string // 전 출석교회/담임목사님 성함

  @Column({ nullable: true })
  carNumber: string // 차량번호

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

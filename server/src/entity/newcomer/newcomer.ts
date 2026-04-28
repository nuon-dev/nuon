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
  id!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  yearOfBirth: number | null = null

  @Column({ nullable: true })
  birthday: string | null = null

  @Column({ nullable: true })
  gender: "man" | "woman" | "" = ""

  @Column({ nullable: true })
  phone: string | null = null // 연락처

  @Column({ nullable: true })
  address: string | null = null // 주소

  @Column({ nullable: true })
  occupation: string | null = null // 신분(학생-학교/전공, 대학원생-학교/전공, 취업준비-준비계열/분야, 직장인-계열/분야)

  @Column({ nullable: true })
  visitPath: string | null = null // 방문경로

  @Column({ nullable: true })
  registrationMotivation: string | null = null // 등록계기

  @Column({
    type: "enum",
    enum: FaithLevel,
    nullable: true,
  })
  faithLevel!: FaithLevel // 신앙생활(초신자, 세례, 입교, 학습)

  @Column({ nullable: true })
  previousChurch: string | null = null // 전 출석교회/담임목사님 성함

  @Column({ nullable: true })
  carNumber: string | null = null // 차량번호

  @Column({ nullable: true })
  registrationDate: string | null = null // 등록일

  @ManyToOne(() => User)
  @JoinColumn({ name: "guiderId" })
  guider!: User // 인도자

  @Column({
    type: "enum",
    enum: NewcomerStatus,
    default: NewcomerStatus.NORMAL,
  })
  status!: NewcomerStatus

  @Column({ nullable: true })
  promotionDate: string | null = null // 등반일

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: "assignmentId" })
  assignment!: Community // 배정 (등반 후 배정받는 순)

  @Column({ nullable: true })
  pendingDate: string | null = null // 보류일

  @ManyToOne(() => NewcomerManager)
  @JoinColumn({ name: "newcomerManagerId" })
  newcomerManager!: NewcomerManager // 섬김이(담당자)

  @OneToMany(() => NewcomerEducation, (education) => education.newcomer)
  educationRecords!: NewcomerEducation[]

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updatedAt!: Date

  @DeleteDateColumn({
    type: "timestamp",
    nullable: true,
  })
  deletedAt: Date | null = null // 삭제일
}

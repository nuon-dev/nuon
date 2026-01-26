import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Newcomer } from "./newcomer"
import { WorshipSchedule } from "./worshipSchedule"
import { EducationLecture } from "./types"

@Entity()
export class NewcomerEducation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Newcomer, (newcomer) => newcomer.educationRecords)
  @JoinColumn({ name: "newcomerId" })
  newcomer: Newcomer

  @ManyToOne(() => WorshipSchedule)
  @JoinColumn({ name: "worshipScheduleId" })
  worshipSchedule: WorshipSchedule

  @Column({
    type: "enum",
    enum: EducationLecture,
  })
  lectureType: EducationLecture

  @Column({ type: "text", nullable: true })
  memo: string
}

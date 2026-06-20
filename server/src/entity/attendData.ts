import { AttendStatus } from "./types"
import { User } from "./user"
import { WorshipSchedule } from "./worshipSchedule"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class AttendData {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => WorshipSchedule, (worshipSchedule) => worshipSchedule.id)
  worshipSchedule!: WorshipSchedule

  @ManyToOne(() => User, (user) => user.id)
  user!: User

  @Column()
  isAttend!: AttendStatus

  @Column({ default: "" })
  memo!: string
}

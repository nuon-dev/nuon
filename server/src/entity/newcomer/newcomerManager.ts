import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "../user"

@Entity()
export class NewcomerManager {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}

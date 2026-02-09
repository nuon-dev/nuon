import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "../user"
import type { Newcomer } from "./newcomer"

@Entity()
export class NewcomerManager {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @OneToMany("Newcomer", "newcomerManager")
  newcomers: Newcomer[]
}

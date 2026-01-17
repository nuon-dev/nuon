import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import { AIChat } from "./aiChat"
import { User } from "../user"

@Entity()
export class AIChatRoom {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToMany(() => AIChat, (chat) => chat.roomId)
  chats: AIChat[]

  @ManyToOne(() => User, (user) => user.id)
  user: User

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date
}

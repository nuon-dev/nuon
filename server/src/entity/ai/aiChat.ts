import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { AIChatRoom } from "./aiChatRoom"

export enum ChatType {
  USER = "user",
  AI = "ai",
  SYSTEM = "system",
}

@Entity()
export class AIChat {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => AIChatRoom, (room) => room.id)
  roomId: string

  @Column({ type: "enum", enum: ChatType })
  type: ChatType

  @Column("text")
  message: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date
}

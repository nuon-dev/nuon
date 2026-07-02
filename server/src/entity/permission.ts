import { PermissionType } from "./types"
import { User } from "./user"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.permissions)
  user!: User

  @Column({
    type: "varchar",
    length: 255,
  })
  permissionType!: PermissionType

  @Column()
  have!: boolean
}

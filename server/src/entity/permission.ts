import { User } from "./user"
import { PermissionType } from "./types"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.permissions)
  user!: User

  @Column()
  permissionType!: PermissionType

  @Column()
  have!: boolean
}

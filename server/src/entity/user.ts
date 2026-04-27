import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from "typeorm"
import { Community } from "./community"
import { Permission } from "./permission"
import { RetreatAttend } from "./retreat/retreatAttend"

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  kakaoId: string

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  yearOfBirth: number

  @Column({ nullable: true })
  gender: "man" | "woman" | ""

  @Column({ nullable: true })
  phone: string

  @Column({
    nullable: true,
  })
  etc?: string

  @Column({ nullable: true, select: false })
  token: string

  @Column({ nullable: true, select: false })
  expire: Date

  @Column({ nullable: true, default: 0 })
  isSuperUser: boolean

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt: Date

  @DeleteDateColumn({
    type: "timestamp",
    nullable: true,
  })
  deletedAt: Date | null

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[]

  @Column({ default: 0 })
  profile: number

  @ManyToOne(() => Community, (community) => community.users)
  community: Community | null

  @OneToOne(() => RetreatAttend, (retreatAttend) => retreatAttend.user, {
    nullable: true,
  })
  retreatAttend: RetreatAttend | null
}

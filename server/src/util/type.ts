import { Community } from "../entity/community"

export interface Role {
  Admin: boolean
  Leader: boolean
  VillageLeader: boolean
  NewcomerManager: boolean
}

export interface jwtPayload {
  id: string
  name: string
  yearOfBirth: number
  community: Community
  role: Role
  iat: number
  exp: number
}

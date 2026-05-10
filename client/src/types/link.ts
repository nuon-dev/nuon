//Todo: enum 문제 때문에 존재함, 해결한 뒤 서버 types로 대체 필요

export interface Link {
  id: string
  title: string
  type: "link" | "text"
  url?: string
  body?: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

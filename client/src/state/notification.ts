import { atom } from "jotai"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface NotificationOptions {
  message: string
  type?: NotificationType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const notificationAtom = atom<NotificationOptions | null>(null)

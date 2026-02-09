import { useSetAtom } from "jotai"
import { notificationAtom, NotificationOptions } from "@/state/notification"

export function useNotification() {
  const setNotification = useSetAtom(notificationAtom)

  return {
    notify: (message: string, options?: Partial<NotificationOptions>) => {
      setNotification({
        message,
        type: options?.type || "success",
        duration: options?.duration || 4000,
        action: options?.action,
      })
    },
    success: (
      message: string,
      options?: Omit<NotificationOptions, "type" | "message">,
    ) => {
      setNotification({
        message,
        type: "success",
        duration: options?.duration || 4000,
        action: options?.action,
      })
    },
    error: (
      message: string,
      options?: Omit<NotificationOptions, "type" | "message">,
    ) => {
      setNotification({
        message,
        type: "error",
        duration: options?.duration || 4000,
        action: options?.action,
      })
    },
    warning: (
      message: string,
      options?: Omit<NotificationOptions, "type" | "message">,
    ) => {
      setNotification({
        message,
        type: "warning",
        duration: options?.duration || 4000,
        action: options?.action,
      })
    },
    info: (
      message: string,
      options?: Omit<NotificationOptions, "type" | "message">,
    ) => {
      setNotification({
        message,
        type: "info",
        duration: options?.duration || 4000,
        action: options?.action,
      })
    },
  }
}

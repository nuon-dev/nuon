import { useEffect, useState, useCallback, useRef } from "react"
import { useAtom } from "jotai"
import { notificationAtom, NotificationType } from "@/state/notification"
import {
  Alert,
  Snackbar,
  Stack,
  Slide,
  Fade,
  Box,
  Typography,
  Button,
} from "@mui/material"
import { TransitionProps } from "@mui/material/transitions"
import React from "react"

// Slide transition component for smoother animations
function SlideTransition(
  props: TransitionProps & { children: React.ReactElement },
) {
  return <Slide {...props} direction="left" />
}

interface NotificationItem {
  id: number
  content: string
  isVisible: boolean
  type: NotificationType
  duration: number
  action?: {
    label: string
    onClick: () => void
  }
}

export default function Notification() {
  const [notification, setNotification] = useAtom(notificationAtom)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [nextId, setNextId] = useState(1)
  const timerRefs = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Add new notification when message changes
  useEffect(() => {
    if (notification) {
      const newNotification: NotificationItem = {
        id: nextId,
        content: notification.message,
        isVisible: true,
        type: notification.type || "success",
        duration: notification.duration || 4000,
        action: notification.action,
      }

      setNotifications((prev) => [...prev, newNotification])
      setNextId(nextId + 1)
      setNotification(null)

      // Auto remove after duration
      const timer = setTimeout(() => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === newNotification.id
              ? { ...notif, isVisible: false }
              : notif,
          ),
        )

        // Remove from array after fade out animation
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notif) => notif.id !== newNotification.id),
          )
        }, 300)
      }, newNotification.duration)

      timerRefs.current.set(newNotification.id, timer)
    }
  }, [notification, nextId, setNotification])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach((timer) => clearTimeout(timer))
      timerRefs.current.clear()
    }
  }, [])

  const handleClose = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isVisible: false } : notif,
      ),
    )

    const timer = timerRefs.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timerRefs.current.delete(id)
    }

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }, 300)
  }, [])

  const getSeverityColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return {
          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
          color: "white",
        }
      case "error":
        return {
          background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
          color: "white",
        }
      case "warning":
        return {
          background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
          color: "white",
        }
      case "info":
        return {
          background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
          color: "white",
        }
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 20,
        zIndex: 9999,
        minWidth: 320,
        maxWidth: 400,
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => {
          const colors = getSeverityColor(notification.type)
          return (
            <Fade
              key={notification.id}
              in={notification.isVisible}
              timeout={300}
            >
              <Box>
                <Alert
                  severity={notification.type}
                  onClose={() => handleClose(notification.id)}
                  action={
                    notification.action ? (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                          notification.action!.onClick()
                          handleClose(notification.id)
                        }}
                        sx={{
                          color: "white",
                          textDecoration: "underline",
                          fontWeight: 600,
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    ) : undefined
                  }
                  sx={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderRadius: 2,
                    "& .MuiAlert-message": {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    },
                    "& .MuiAlert-action": {
                      padding: 0,
                    },
                    background: colors.background,
                    color: colors.color,
                    "& .MuiAlert-icon, & .MuiIconButton-root": {
                      color: colors.color,
                      fontSize: "1.2rem",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {notification.content}
                  </Typography>
                </Alert>
              </Box>
            </Fade>
          )
        })}
      </Stack>
    </Box>
  )
}

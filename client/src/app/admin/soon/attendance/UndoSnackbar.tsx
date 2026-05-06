"use client"

import { Button, Snackbar } from "@mui/material"
import { statusLabel } from "./utils/attendanceUtils"
import { UndoAction } from "./useBulkAttendance"

type Props = {
  action: UndoAction | null
  bulkBarVisible: boolean
  onUndo: () => void
  onDismiss: () => void
}

export function UndoSnackbar({
  action,
  bulkBarVisible,
  onUndo,
  onDismiss,
}: Props) {
  return (
    <Snackbar
      open={Boolean(action)}
      autoHideDuration={10000}
      onClose={(_, reason) => {
        if (reason === "clickaway") return
        onDismiss()
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        // bulk bar 위로 / 없으면 최소 여백. 모두 safe-area inset 추가
        mb: bulkBarVisible
          ? "calc(80px + env(safe-area-inset-bottom, 0px))"
          : "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
      message={
        action
          ? `${action.userIds.length}명에게 '${statusLabel(action.newStatus)}' 적용됨`
          : ""
      }
      action={
        <Button color="inherit" size="small" onClick={onUndo}>
          실행 취소
        </Button>
      }
    />
  )
}

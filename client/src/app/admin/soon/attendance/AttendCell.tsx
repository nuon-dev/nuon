"use client"

import { useState } from "react"
import {
  Box,
  Popover,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material"
import { AttendData } from "@server/entity/attendData"
import { AttendStatus } from "@server/entity/types"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HelpIcon from "@mui/icons-material/Help"

interface AttendCellProps {
  attendData: AttendData | undefined
  editable?: boolean
  onSave?: (status: AttendStatus, memo: string) => Promise<void> | void
}

export default function AttendCell({
  attendData,
  editable = false,
  onSave,
}: AttendCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [status, setStatus] = useState<AttendStatus>(AttendStatus.ATTEND)
  const [memo, setMemo] = useState("")
  const [saving, setSaving] = useState(false)

  function handleOpen(e: React.MouseEvent<HTMLElement>) {
    if (!editable) return
    setStatus(attendData?.isAttend ?? AttendStatus.ATTEND)
    setMemo(attendData?.memo ?? "")
    setAnchorEl(e.currentTarget)
  }

  async function handleSave() {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(status, memo)
      setAnchorEl(null)
    } finally {
      setSaving(false)
    }
  }

  let bg = "transparent"
  let label: React.ReactNode = "-"

  if (attendData?.isAttend === AttendStatus.ATTEND) {
    bg = "rgb(184, 248, 93)"
    label = "출석"
  } else if (attendData?.isAttend === AttendStatus.ABSENT) {
    bg = "rgb(240, 148, 128)"
    label = attendData.memo || "결석"
  } else if (attendData?.isAttend === AttendStatus.ETC) {
    bg = "rgb(253, 241, 113)"
    label = attendData.memo || "기타"
  }

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          width: "100%",
          height: "100%",
          textAlign: "center",
          alignContent: "center",
          justifyContent: "center",
          cursor: editable ? "pointer" : "default",
          fontSize: "0.85rem",
          bgcolor: bg,
          transition: "opacity 0.15s",
          "&:hover": editable ? { opacity: 0.72 } : {},
        }}
      >
        {label}
      </Box>
      {editable && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => {
            if (!saving) setAnchorEl(null)
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Stack p={2} spacing={1.5} minWidth={220}>
            <Typography variant="caption" color="text.secondary">
              출석 수정
            </Typography>
            <Select
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendStatus)}
            >
              <MenuItem value={AttendStatus.ATTEND}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                  <span>출석</span>
                </Stack>
              </MenuItem>
              <MenuItem value={AttendStatus.ABSENT}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CancelIcon sx={{ color: "#f44336", fontSize: 16 }} />
                  <span>결석</span>
                </Stack>
              </MenuItem>
              <MenuItem value={AttendStatus.ETC}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <HelpIcon sx={{ color: "#ff9800", fontSize: 16 }} />
                  <span>기타</span>
                </Stack>
              </MenuItem>
            </Select>
            {status !== AttendStatus.ATTEND && (
              <TextField
                size="small"
                placeholder="사유"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                autoFocus
              />
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                onClick={() => setAnchorEl(null)}
                disabled={saving}
              >
                취소
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "저장 중…" : "저장"}
              </Button>
            </Stack>
          </Stack>
        </Popover>
      )}
    </>
  )
}

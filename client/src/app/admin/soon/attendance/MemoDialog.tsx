"use client"

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material"
import { AttendStatus } from "@server/entity/types"

export type MemoDialogState = {
  status: AttendStatus
  memo: string
}

type Props = {
  state: MemoDialogState | null
  selectedCount: number
  onChange: (next: MemoDialogState | null) => void
  onApply: () => void
}

export function MemoDialog({ state, selectedCount, onChange, onApply }: Props) {
  const close = () => onChange(null)

  return (
    <Dialog open={Boolean(state)} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>
        {state?.status === AttendStatus.ABSENT ? "결석" : "기타"} 사유
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedCount}명에게 공통으로 적용할 사유 (비워두면 각자 빈칸)
        </Typography>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          placeholder="예: 가족 행사, 시험 준비 등"
          value={state?.memo ?? ""}
          onChange={(e) =>
            state && onChange({ ...state, memo: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply()
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>취소</Button>
        <Button variant="contained" onClick={onApply}>
          적용
        </Button>
      </DialogActions>
    </Dialog>
  )
}

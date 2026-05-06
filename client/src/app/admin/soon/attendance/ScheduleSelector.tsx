"use client"

import { Paper, TextField } from "@mui/material"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import { worshipKr } from "@/util/worship"

type Props = {
  schedules: WorshipSchedule[]
  value: number | ""
  onChange: (id: number | "") => void
}

// 모바일에서 OS 네이티브 picker(iOS 휠, Android 다이얼로그)를 쓰려고 native select.
export function ScheduleSelector({ schedules, value, onChange }: Props) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <TextField
        select
        SelectProps={{ native: true }}
        value={value}
        label="예배"
        fullWidth
        size="small"
        onChange={(e) => onChange(Number(e.target.value) || "")}
        InputLabelProps={{ shrink: true }}
      >
        {schedules.map((s) => (
          <option key={s.id} value={s.id}>
            {s.date} · {worshipKr(s.kind)}
          </option>
        ))}
      </TextField>
    </Paper>
  )
}

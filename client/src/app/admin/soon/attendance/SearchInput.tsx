"use client"

import { Paper, TextField } from "@mui/material"

type Props = {
  value: string
  onChange: (next: string) => void
}

export function SearchInput({ value, onChange }: Props) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="이름 검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Paper>
  )
}

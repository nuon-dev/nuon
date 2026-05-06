"use client"

import { Paper, TextField } from "@mui/material"

interface SearchInputProps {
  value: string
  onChange: (next: string) => void
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
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

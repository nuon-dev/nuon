"use client"

import { Box, Chip, Paper, Typography } from "@mui/material"
import { StatusFilter } from "./utils/attendanceUtils"

export type StatusCounts = {
  all: number
  unrecorded: number
  ATTEND: number
  ABSENT: number
  ETC: number
}

interface StatusFilterBarProps {
  counts: StatusCounts
  value: StatusFilter
  onChange: (next: StatusFilter) => void
}

const FILTERS: { k: StatusFilter; label: string }[] = [
  { k: "all", label: "전체" },
  { k: "unrecorded", label: "기록안됨" },
  { k: "ATTEND", label: "출석" },
  { k: "ABSENT", label: "결석" },
  { k: "ETC", label: "기타" },
]

export default function StatusFilterBar({
  counts,
  value,
  onChange,
}: StatusFilterBarProps) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        상태별 필터
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 1,
          overflowX: "auto",
          overflowY: "hidden",
          "& > *": { flexShrink: 0 },
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          // 우측 페이드로 스크롤 가능 암시
          WebkitMaskImage:
            "linear-gradient(to right, black calc(100% - 24px), transparent)",
          maskImage:
            "linear-gradient(to right, black calc(100% - 24px), transparent)",
          pr: 3,
          pb: 0.5,
        }}
      >
        {FILTERS.map(({ k, label }) => {
          const count = counts[k]
          return (
            <Chip
              key={k}
              label={`${label} · ${count}`}
              color={value === k ? "primary" : "default"}
              variant={value === k ? "filled" : "outlined"}
              onClick={() => onChange(k)}
              disabled={k !== "all" && count === 0}
            />
          )
        })}
      </Box>
    </Paper>
  )
}

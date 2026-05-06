"use client"

import { Chip } from "@mui/material"
import { StatusFilter } from "./utils/attendanceUtils"

const baseSx = {
  fontWeight: 600,
  maxWidth: { xs: 140, sm: 200, md: 260 },
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}

export function StatusChip({
  status,
  memo,
}: {
  status: StatusFilter
  memo?: string
}) {
  if (status === "ATTEND") {
    return (
      <Chip
        size="small"
        label="출석"
        title="출석"
        sx={{ ...baseSx, bgcolor: "rgb(184, 248, 93)" }}
      />
    )
  }
  if (status === "ABSENT") {
    const full = memo ? `결석 · ${memo}` : "결석"
    return (
      <Chip
        size="small"
        label={full}
        title={full}
        sx={{ ...baseSx, bgcolor: "rgb(240, 148, 128)" }}
      />
    )
  }
  if (status === "ETC") {
    const full = memo ? `기타 · ${memo}` : "기타"
    return (
      <Chip
        size="small"
        label={full}
        title={full}
        sx={{ ...baseSx, bgcolor: "rgb(253, 241, 113)" }}
      />
    )
  }
  return null
}

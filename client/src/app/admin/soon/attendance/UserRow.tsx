"use client"

import { memo } from "react"
import { Box, Checkbox, Chip, Stack, Typography } from "@mui/material"
import { User } from "@server/entity/user"
import { RowButton } from "./Primitives"
import { StatusChip } from "./StatusChip"
import { StatusFilter } from "./utils/attendanceUtils"

type Props = {
  user: User
  status: StatusFilter
  memo?: string
  checked: boolean
  onToggle: (id: string) => void
  // 마을→다락방 경로 — 검색 결과에서만 채워짐. 둘 다 비면 lineage 미표시.
  vName?: string
  dName?: string
}

export const UserRow = memo(function UserRow({
  user,
  status,
  memo,
  checked,
  onToggle,
  vName,
  dName,
}: Props) {
  const isLeader = user.community?.leader?.id === user.id
  const isDeputy = user.community?.deputyLeader?.id === user.id
  const hasLineage = Boolean(vName || dName)

  return (
    <RowButton focused={checked} onClick={() => onToggle(user.id)}>
      <Checkbox
        size="small"
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggle(user.id)}
      />
      <Stack flex={1} overflow="hidden">
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography noWrap fontWeight={hasLineage ? 500 : undefined}>
            {user.name}
          </Typography>
          {(isLeader || isDeputy) && (
            <Chip
              size="small"
              label={isLeader ? "순장" : "부순장"}
              sx={{
                height: 18,
                fontSize: 10,
                bgcolor: isLeader ? "#e3f2fd" : "#f3e5f5",
              }}
            />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap={hasLineage}>
          {hasLineage ? `${vName} › ${dName} · ` : ""}
          {user.yearOfBirth}년생 · {user.gender === "man" ? "남" : "여"}
        </Typography>
      </Stack>
      <Box>
        <StatusChip status={status} memo={memo} />
      </Box>
    </RowButton>
  )
})

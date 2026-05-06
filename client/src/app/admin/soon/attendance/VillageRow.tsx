"use client"

import { memo } from "react"
import { Checkbox, Chip, Stack, Typography } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { RowButton } from "./Primitives"
import { GroupState } from "./utils/attendanceUtils"
import { getEvangelistMeta } from "./evangelistMap"

type Props = {
  village: Community
  users: User[]
  groupState: GroupState
  isFocused: boolean
  onFocus: (id: number) => void
  onToggleGroup: (users: User[]) => void
}

export const VillageRow = memo(function VillageRow({
  village,
  users,
  groupState,
  isFocused,
  onFocus,
  onToggleGroup,
}: Props) {
  const count = users.length
  const ev = getEvangelistMeta(village.name)

  return (
    <RowButton focused={isFocused} onClick={() => onFocus(village.id)}>
      <Checkbox
        size="small"
        checked={groupState === "all"}
        indeterminate={groupState === "some"}
        disabled={count === 0}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleGroup(users)}
      />
      <Stack flex={1} overflow="hidden">
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography noWrap fontWeight={isFocused ? 700 : 500}>
            {village.name}
          </Typography>
          {ev && (
            <Chip
              size="small"
              label={ev.label}
              sx={{
                height: 18,
                fontSize: 10,
                bgcolor: ev.color,
                color: "white",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {count}명
        </Typography>
      </Stack>
      <ChevronRightIcon fontSize="small" color="disabled" />
    </RowButton>
  )
})

"use client"

import { memo } from "react"
import { Checkbox, Stack, Typography } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { RowButton } from "./Primitives"
import { GroupState } from "./utils/attendanceUtils"

type Props = {
  darak: Community
  users: User[]
  groupState: GroupState
  isFocused: boolean
  onFocus: (id: number) => void
  onToggleGroup: (users: User[]) => void
}

export const DarakRow = memo(function DarakRow({
  darak,
  users,
  groupState,
  isFocused,
  onFocus,
  onToggleGroup,
}: Props) {
  const count = users.length

  return (
    <RowButton focused={isFocused} onClick={() => onFocus(darak.id)}>
      <Checkbox
        size="small"
        checked={groupState === "all"}
        indeterminate={groupState === "some"}
        disabled={count === 0}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleGroup(users)}
      />
      <Stack flex={1} overflow="hidden">
        <Typography noWrap fontWeight={isFocused ? 700 : 500}>
          {darak.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {count}명
        </Typography>
      </Stack>
      <ChevronRightIcon fontSize="small" color="disabled" />
    </RowButton>
  )
})

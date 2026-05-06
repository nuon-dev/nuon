"use client"

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HelpIcon from "@mui/icons-material/Help"
import CloseIcon from "@mui/icons-material/Close"
import { AttendStatus } from "@server/entity/types"

type Props = {
  selectedCount: number
  hiddenSelectedCount: number
  saving: boolean
  onSave: (status: AttendStatus) => void
  onClear: () => void
}

export function BulkActionBar({
  selectedCount,
  hiddenSelectedCount,
  saving,
  onSave,
  onClear,
}: Props) {
  const theme = useTheme()
  // 600px 미만에선 라벨 숨기고 아이콘만
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"))

  if (selectedCount === 0) return null

  const compactBtnSx = {
    minWidth: { xs: 44, sm: "auto" },
    px: { xs: 1, sm: 2 },
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        pt: 1.5,
        px: 1.5,
        // iPhone 홈 인디케이터 인셋 포함
        pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
        zIndex: 100,
        borderTop: "2px solid #1976d2",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight="bold">✓ {selectedCount}명 선택</Typography>
          {hiddenSelectedCount > 0 && (
            <Typography color="warning.main" variant="caption">
              (화면 밖 {hiddenSelectedCount}명 포함)
            </Typography>
          )}
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={isNarrow ? undefined : <CheckCircleIcon />}
            onClick={() => onSave(AttendStatus.ATTEND)}
            disabled={saving}
            size="small"
            title="출석"
            sx={compactBtnSx}
          >
            {isNarrow ? <CheckCircleIcon fontSize="small" /> : "출석"}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={isNarrow ? undefined : <CancelIcon />}
            onClick={() => onSave(AttendStatus.ABSENT)}
            disabled={saving}
            size="small"
            title="결석"
            sx={compactBtnSx}
          >
            {isNarrow ? <CancelIcon fontSize="small" /> : "결석"}
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={isNarrow ? undefined : <HelpIcon />}
            onClick={() => onSave(AttendStatus.ETC)}
            disabled={saving}
            size="small"
            title="기타"
            sx={compactBtnSx}
          >
            {isNarrow ? <HelpIcon fontSize="small" /> : "기타"}
          </Button>
          <Button
            variant="outlined"
            onClick={onClear}
            disabled={saving}
            size="small"
            title="선택 해제"
            sx={compactBtnSx}
          >
            {isNarrow ? <CloseIcon fontSize="small" /> : "해제"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

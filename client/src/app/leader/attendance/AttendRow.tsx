"use client"

import { User } from "@server/entity/user"
import useAttendance from "./useAttendance"
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Avatar,
  FormControl,
} from "@mui/material"
import { AttendStatus } from "@server/entity/types"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HelpIcon from "@mui/icons-material/Help"

export default function AttendRow({ user }: { user: User }) {
  const { soonAttendData, setSoonAttendData } = useAttendance()
  const attendData = soonAttendData.find((data) => data.user.id === user.id)
  if (!attendData) return null

  const isAttend = attendData.isAttend

  function handleAttendChange(
    event: SelectChangeEvent<string>,
    child: React.ReactNode
  ) {
    const newAttendStatus = event.target.value as AttendStatus
    if (!attendData) return
    const newAttendData = { ...attendData, isAttend: newAttendStatus }
    setSoonAttendData((prev) =>
      prev.map((data) =>
        data.user.id === attendData.user.id ? newAttendData : data
      )
    )
  }

  return (
    <Card
      elevation={1}
      sx={{
        transition: "all 0.2s ease",
        "&:hover": {
          elevation: 2,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* 첫 번째 줄: 사용자 정보와 저장 상태 */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: user.gender === "man" ? "#2196f3" : "#e91e63",
                width: 40,
                height: 40,
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Stack flex={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.yearOfBirth}년생
              </Typography>
            </Stack>
            {/* 저장 상태 표시 */}
            <Box
              borderRadius="50%"
              width="12px"
              height="12px"
              bgcolor={attendData?.id ? "#4caf50" : "#f44336"}
              title={attendData?.id ? "저장됨" : "저장되지 않음"}
            />
          </Stack>

          {/* 두 번째 줄: 출석 선택과 사유 입력 */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            {/* 출석 선택 */}
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              <Select
                value={isAttend.toString()}
                onChange={handleAttendChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value={AttendStatus.ATTEND}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                    <span>출석</span>
                  </Stack>
                </MenuItem>
                <MenuItem value={AttendStatus.ABSENT}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CancelIcon sx={{ color: "#f44336", fontSize: 16 }} />
                    <span>결석</span>
                  </Stack>
                </MenuItem>
                <MenuItem value={AttendStatus.ETC}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HelpIcon sx={{ color: "#ff9800", fontSize: 16 }} />
                    <span>기타</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            {/* 사유 입력 */}
            {isAttend !== AttendStatus.ATTEND && (
              <TextField
                placeholder="사유를 입력하세요"
                value={attendData?.memo || ""}
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                onChange={(e) => {
                  const newAttendData = { ...attendData, memo: e.target.value }
                  setSoonAttendData((prev) =>
                    prev.map((data) =>
                      data.user.id === attendData.user.id ? newAttendData : data
                    )
                  )
                }}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

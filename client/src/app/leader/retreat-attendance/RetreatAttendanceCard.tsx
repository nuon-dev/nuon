"use client"

import { Chip, Stack, Typography, Box } from "@mui/material"
import { User } from "@server/entity/user"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import SchoolIcon from "@mui/icons-material/School"
import WorkIcon from "@mui/icons-material/Work"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"

interface RetreatAttendanceCardProps {
  soon: User
}

export default function RetreatAttendanceCard({
  soon,
}: RetreatAttendanceCardProps) {
  const isRegistered = !!soon.retreatAttend

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      padding="16px 20px"
      borderRadius="16px"
      bgcolor="white"
      boxShadow="0 4px 20px 0 rgba(0,0,0,0.05)"
      border={isRegistered ? "1px solid #4caf50" : "1px solid #eee"}
    >
      <Stack gap="4px">
        <Stack direction="row" alignItems="center" gap="8px">
          <Typography fontWeight="700" fontSize="18px">
            {soon.name}
          </Typography>
          <Typography fontSize="14px" color="text.secondary">
            {soon.yearOfBirth}
          </Typography>
        </Stack>

        {isRegistered ? (
          <Stack direction="row" gap="6px" mt="4px">
            <Chip
              label={soon.retreatAttend?.isHalf ? "부분참석" : "전체참석"}
              size="small"
              variant="outlined"
              color={soon.retreatAttend?.isHalf ? "info" : "success"}
              icon={
                soon.retreatAttend?.isHalf ? (
                  <AccessTimeIcon />
                ) : (
                  <EventAvailableIcon />
                )
              }
              sx={{ borderRadius: "6px" }}
            />
            <Chip
              label={soon.retreatAttend?.isWorker ? "직장인" : "학생"}
              size="small"
              variant="outlined"
              color={soon.retreatAttend?.isWorker ? "secondary" : "primary"}
              icon={
                soon.retreatAttend?.isWorker ? <WorkIcon /> : <SchoolIcon />
              }
              sx={{ borderRadius: "6px" }}
            />
          </Stack>
        ) : (
          <Typography fontSize="13px" color="#ff6b6b" fontWeight="500">
            수련회 미신청
          </Typography>
        )}
      </Stack>

      <Box>
        {isRegistered ? (
          <Stack alignItems="center" gap="2px">
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
            <Typography fontSize="10px" fontWeight="600" color="#4caf50">
              신청완료
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" gap="2px">
            <CancelIcon sx={{ color: "#e0e0e0", fontSize: 28 }} />
            <Typography fontSize="10px" fontWeight="600" color="#bdbdbd">
              미신청
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}

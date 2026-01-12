import { Box, Stack, Typography, Paper, Chip } from "@mui/material"
import { User } from "@server/entity/user"
import { AttendData } from "@server/entity/attendData"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import AttendCell from "./AttendCell"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/StarBorder"

interface AttendanceTableProps {
  soonList: User[]
  attendDataList: AttendData[]
  worshipScheduleMapList: WorshipSchedule[]
  leaders: User[]
  getAttendUserCount: (
    attendDataList: AttendData[],
    worshipScheduleId: number
  ) => { count: number; attend: number }
}

export default function AttendanceTable({
  soonList,
  attendDataList,
  worshipScheduleMapList,
  leaders,
  getAttendUserCount,
}: AttendanceTableProps) {
  return (
    <Box sx={{ p: 2 }}>
      {/* 출석 테이블 제목 */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        출석 현황
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        {/* Table Header */}
        <Stack
          direction="row"
          sx={{
            minWidth: "fit-content",
            bgcolor: "#f5f5f5",
            borderBottom: "2px solid #e0e0e0",
            top: 0,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 150,
              minWidth: 150,
              maxWidth: 150,
              p: 1.5,
              borderRight: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              순장 현황
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={`남 ${
                  leaders.filter((user) => user.gender === "man").length
                }`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`여 ${
                  leaders.filter((user) => user.gender === "woman").length
                }`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Stack>
          </Box>

          {worshipScheduleMapList.map((worshipSchedule) => {
            const { attend, count } = getAttendUserCount(
              attendDataList,
              worshipSchedule.id
            )
            const percentage =
              count > 0 ? Math.round((attend / count) * 100) : 0

            return (
              <Box
                key={worshipSchedule.id}
                sx={{
                  width: 98,
                  minWidth: 98,
                  maxWidth: 98,
                  p: 1.5,
                  borderRight: "1px solid #e0e0e0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {worshipSchedule.date}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({attend}/{count}) {percentage}%
                </Typography>
              </Box>
            )
          })}
        </Stack>

        {/* Table Body */}
        {soonList.map((user) => {
          const isLeader = user.community?.leader?.id === user.id
          const isDeputyLeader = user.community?.deputyLeader?.id === user.id

          return (
            <Stack
              key={user.id}
              direction="row"
              sx={{
                minWidth: "fit-content",
                bgcolor: isLeader
                  ? "#e3f2fd"
                  : isDeputyLeader
                  ? "#f3e5f5"
                  : "white",
                borderBottom: "1px solid #e0e0e0",
                "&:hover": {
                  bgcolor: isLeader
                    ? "#bbdefb"
                    : isDeputyLeader
                    ? "#e1bee7"
                    : "#f5f5f5",
                },
              }}
            >
              <Box
                sx={{
                  width: 150,
                  minWidth: 150,
                  maxWidth: 150,
                  p: 1.5,
                  borderRight: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {isLeader && (
                    <StarIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                  )}
                  {isDeputyLeader && (
                    <StarBorderIcon sx={{ fontSize: 16, color: "#7b1fa2" }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: user.gender === "man" ? "#1976d2" : "#d32f2f",
                      fontWeight:
                        isLeader || isDeputyLeader ? "bold" : "normal",
                    }}
                  >
                    {user.name} ({user.yearOfBirth})
                  </Typography>
                </Stack>
              </Box>

              {worshipScheduleMapList.map((worshipSchedule) => {
                const attendData = attendDataList.find(
                  (data) =>
                    data.user.id === user.id &&
                    data.worshipSchedule.id === worshipSchedule.id
                )
                return (
                  <Box
                    key={worshipSchedule.id}
                    sx={{
                      width: 114,
                      minWidth: 114,
                      maxWidth: 114,
                      p: "4px",
                      borderRight: "1px solid #e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AttendCell attendData={attendData} />
                  </Box>
                )
              })}
            </Stack>
          )
        })}
      </Paper>
    </Box>
  )
}

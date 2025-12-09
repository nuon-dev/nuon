"use client"

import {
  Button,
  MenuItem,
  Select,
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Container,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material"
import Header from "@/app/leader/components/Header"
import { post } from "@/config/api"
import { worshipKr } from "@/util/worship"
import useAttendance from "./useAttendance"
import AttendRow from "./AttendRow"
import SaveIcon from "@mui/icons-material/Save"
import EventNoteIcon from "@mui/icons-material/EventNote"
import PeopleIcon from "@mui/icons-material/People"

export default function SoonAttendance() {
  const {
    selectedScheduleId,
    soonAttendData,
    getAttendData,
    setSelectedScheduleId,
    worshipScheduleList,
    groupInfo,
  } = useAttendance()

  async function saveAttendData() {
    await post("/soon/attendance", {
      scheduleId: selectedScheduleId,
      attendData: soonAttendData,
    })
    if (selectedScheduleId) {
      getAttendData(selectedScheduleId)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* 페이지 헤더 */}
          <Card
            elevation={2}
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <EventNoteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                출석 관리
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                순원들의 출석을 관리해보세요
              </Typography>
            </CardContent>
          </Card>

          {/* 예배 선택 */}
          <Card elevation={1}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  예배 선택
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>예배를 선택하세요</InputLabel>
                  <Select
                    value={selectedScheduleId}
                    label="예배를 선택하세요"
                    onChange={(e) => {
                      setSelectedScheduleId(e.target.value as number)
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {worshipScheduleList.map((schedule) => (
                      <MenuItem key={schedule.id} value={schedule.id}>
                        {schedule.date} - {worshipKr(schedule.kind)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* 그룹 정보 */}
          {groupInfo && (
            <Card elevation={1}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PeopleIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h6" fontWeight="bold">
                    {groupInfo.name} 다락방
                  </Typography>
                  <Chip
                    label={`${groupInfo.users.length}명`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* 출석 현황 */}
          {groupInfo && groupInfo.users.length > 0 && (
            <Card elevation={1}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    출석 현황
                  </Typography>
                  <Stack spacing={2}>
                    {groupInfo.users.map((user) => (
                      <AttendRow key={user.id} user={user} />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* 저장 버튼 */}
          {selectedScheduleId && (
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={saveAttendData}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(255, 105, 135, .4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              출석 정보 저장
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

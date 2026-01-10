"use client"

import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  Divider,
  FormControl,
  InputLabel,
} from "@mui/material"
import { useSetAtom } from "jotai"
import { worshipKr } from "@/util/worship"
import { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { NotificationMessage } from "@/state/notification"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import { WorshipKind, WorshipSchedule } from "@server/entity/worshipSchedule"
import axios from "@/config/axios"
import dayjs from "dayjs"

export default function WorshipSchedulePage() {
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const [worshipScheduleList, setWorshipScheduleList] = useState<
    WorshipSchedule[]
  >([])

  // Filter lists
  const [filterStartDate, setFilterStartDate] = useState(
    dayjs().add(-1, "month").format("YYYY-MM-DD")
  )
  const [filterEndDate, setFilterEndDate] = useState(
    dayjs().format("YYYY-MM-DD")
  )
  const [filterKind, setFilterKind] = useState<string>("")
  const [filterCanEdit, setFilterCanEdit] = useState<string>("")
  const [filterIsVisible, setFilterIsVisible] = useState<string>("")

  const [selectedWorship, setSelectedWorship] = useState<WorshipSchedule>({
    date: "",
    kind: WorshipKind.SundayService,
    isVisible: true,
    canEdit: true,
  } as WorshipSchedule)

  useEffect(() => {
    fetchWorshipSchedules()
  }, [])

  function editWorshipSchedule(key: keyof WorshipSchedule, value: any) {
    setSelectedWorship({
      ...selectedWorship,
      [key]: value,
    })
  }

  async function fetchWorshipSchedules() {
    const params: any = {}
    if (filterStartDate) params.startDate = filterStartDate
    if (filterEndDate) params.endDate = filterEndDate
    if (filterKind) params.kind = filterKind
    if (filterCanEdit) params.canEdit = filterCanEdit
    if (filterIsVisible) params.isVisible = filterIsVisible

    const { data: worshipScheduleList } = await axios.get(
      "/admin/worship-schedule",
      { params }
    )
    setWorshipScheduleList(worshipScheduleList)
  }

  async function saveWorshipSchedule() {
    if (!selectedWorship.date || !selectedWorship.kind) {
      setNotificationMessage("날짜와 종류를 모두 입력해주세요.")
      return
    }
    if (selectedWorship.id) {
      await axios.put("/admin/worship-schedule", selectedWorship)
    } else {
      await axios.post("/admin/worship-schedule", selectedWorship)
    }
    setNotificationMessage("예배 일정이 저장되었습니다.")
    await fetchWorshipSchedules()
  }

  function resetSelectedWorship() {
    setSelectedWorship({
      date: "",
      kind: WorshipKind.SundayService,
      isVisible: true,
      canEdit: true,
    } as WorshipSchedule)
  }

  async function deleteWorshipSchedule() {
    if (!selectedWorship.id) return
    await axios.delete(`/admin/worship-schedule/${selectedWorship.id}`)
    setNotificationMessage("예배 일정이 삭제되었습니다.")
    await fetchWorshipSchedules()
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          예배 일정 관리
        </Typography>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          {/* 예배 일정 목록 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CalendarMonthIcon sx={{ color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold">
                  예배 일정 목록
                </Typography>
                <Chip
                  label={`총 ${worshipScheduleList.length}개`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Paper
                elevation={0}
                sx={{ p: 2, mb: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ "& > *": { mb: { xs: 1, md: 0 } } }}
                >
                  <TextField
                    label="시작 날짜"
                    type="date"
                    size="small"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <TextField
                    label="종료 날짜"
                    type="date"
                    size="small"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>예배 종류</InputLabel>
                    <Select
                      value={filterKind}
                      label="예배 종류"
                      onChange={(e) => setFilterKind(e.target.value)}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value={WorshipKind.SundayService}>
                        {worshipKr(WorshipKind.SundayService)}
                      </MenuItem>
                      <MenuItem value={WorshipKind.FridayService}>
                        {worshipKr(WorshipKind.FridayService)}
                      </MenuItem>
                      <MenuItem value={WorshipKind.Etc}>
                        {worshipKr(WorshipKind.Etc)}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>수정 가능</InputLabel>
                    <Select
                      value={filterCanEdit}
                      label="수정 가능"
                      onChange={(e) => setFilterCanEdit(e.target.value)}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="true">가능</MenuItem>
                      <MenuItem value="false">불가능</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>조회 여부</InputLabel>
                    <Select
                      value={filterIsVisible}
                      label="조회 여부"
                      onChange={(e) => setFilterIsVisible(e.target.value)}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="true">공개</MenuItem>
                      <MenuItem value="false">비공개</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={fetchWorshipSchedules}
                  >
                    조회
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        날짜
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        종류
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        상태
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {worshipScheduleList
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          onClick={() => setSelectedWorship(schedule)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor:
                              selectedWorship?.id === schedule.id
                                ? "#e3f2fd"
                                : "inherit",
                            "&:hover": {
                              backgroundColor:
                                selectedWorship?.id === schedule.id
                                  ? "#bbdefb"
                                  : "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell align="center">
                            <Typography variant="body2">
                              {schedule.date}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={worshipKr(schedule.kind)}
                              size="small"
                              color={
                                schedule.kind === WorshipKind.SundayService
                                  ? "primary"
                                  : "secondary"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="center"
                            >
                              <Chip
                                label={
                                  schedule.isVisible ? "조회 가능" : "숨기기"
                                }
                                size="small"
                                color={
                                  schedule.isVisible ? "success" : "default"
                                }
                                variant="filled"
                              />
                              <Chip
                                label={
                                  schedule.canEdit ? "수정가능" : "수정불가"
                                }
                                size="small"
                                color={schedule.canEdit ? "info" : "warning"}
                                variant="outlined"
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Paper>
            </CardContent>
          </Card>
          {/* 예배 일정 편집 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <EditIcon sx={{ color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold">
                  {selectedWorship?.id ? "예배 일정 수정" : "새 예배 일정 추가"}
                </Typography>
              </Stack>

              <Stack spacing={2} mb={3}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    날짜
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={selectedWorship?.date || ""}
                    onChange={(e) =>
                      editWorshipSchedule("date", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    예배 종류
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedWorship?.kind || WorshipKind.SundayService}
                    onChange={(e) =>
                      editWorshipSchedule("kind", e.target.value)
                    }
                    size="small"
                  >
                    <MenuItem value={WorshipKind.SundayService}>
                      {worshipKr(WorshipKind.SundayService)}
                    </MenuItem>
                    <MenuItem value={WorshipKind.FridayService}>
                      {worshipKr(WorshipKind.FridayService)}
                    </MenuItem>
                    <MenuItem value={WorshipKind.Etc}>
                      {worshipKr(WorshipKind.Etc)}
                    </MenuItem>
                  </Select>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    수정 가능 여부
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedWorship?.canEdit ? "true" : "false"}
                    onChange={(e) =>
                      editWorshipSchedule("canEdit", e.target.value === "true")
                    }
                    size="small"
                  >
                    <MenuItem value="true">수정 가능</MenuItem>
                    <MenuItem value="false">수정 불가</MenuItem>
                  </Select>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    조회 여부
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedWorship?.isVisible ? "true" : "false"}
                    onChange={(e) =>
                      editWorshipSchedule(
                        "isVisible",
                        e.target.value === "true"
                      )
                    }
                    size="small"
                  >
                    <MenuItem value="true">조회 가능</MenuItem>
                    <MenuItem value="false">숨기기</MenuItem>
                  </Select>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={resetSelectedWorship}
                  startIcon={<AddIcon />}
                >
                  새로 추가하기
                </Button>
                {selectedWorship?.id && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={deleteWorshipSchedule}
                    startIcon={<DeleteIcon />}
                  >
                    삭제
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={saveWorshipSchedule}
                  startIcon={<SaveIcon />}
                >
                  {selectedWorship?.id ? "수정하기" : "추가하기"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  )
}

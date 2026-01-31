"use client"

import axios from "@/config/axios"
import {
  Stack,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  MenuItem,
  Select,
} from "@mui/material"
import { useEffect, useState } from "react"
import useAuth from "@/hooks/useAuth"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"

interface WorshipSchedule {
  id: number
  date: string
}

interface EducationRecord {
  id: string
  lectureType: string
  worshipScheduleId: number
  memo: string | null
}

interface NewcomerEducation {
  id: string
  name: string
  yearOfBirth: number | null
  gender: string | null
  education: Record<string, EducationRecord | null>
}

interface EducationResponse {
  worshipSchedules: WorshipSchedule[]
  newcomers: NewcomerEducation[]
}

// 강의 타입별 색상 (value 기준)
const lectureColors: Record<string, string> = {
  "": "transparent",
  OT: "#b8f85d",
  L1: "#fdf171",
  L2: "#fdf171",
  L3: "#fdf171",
  L4: "#fdf171",
  L5: "#fdf171",
}

// value: API로 보내는 값, label: 화면에 표시하는 값
const lectureOptions = [
  { value: "", label: "-" },
  { value: "OT", label: "OT" },
  { value: "L1", label: "1강" },
  { value: "L2", label: "2강" },
  { value: "L3", label: "3강" },
  { value: "L4", label: "4강" },
  { value: "L5", label: "5강" },
]

// value → label 변환
const getLectureLabel = (value: string) => {
  return lectureOptions.find((o) => o.value === value)?.label || value
}

// 테이블 셀 너비 상수
const NAME_CELL_WIDTH = 150
const DATE_CELL_WIDTH = 100

export default function NewcomerEducationPage() {
  const { isLeaderIfNotExit } = useAuth()
  const [educationData, setEducationData] = useState<EducationResponse | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [savingCell, setSavingCell] = useState<string | null>(null) // 저장 중인 셀 표시
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    isLeaderIfNotExit("/leader/newcomer/education")
    fetchEducationData()
  }, [])

  async function fetchEducationData() {
    try {
      setLoading(true)
      const { data } = await axios.get<EducationResponse>("/newcomer/education")

      // 출석률 기준 정렬
      const sortedNewcomers = sortByAttendanceRate(
        data.newcomers,
        data.worshipSchedules,
      )
      setEducationData({
        ...data,
        newcomers: sortedNewcomers,
      })
    } catch (error) {
      console.error("Error fetching education data:", error)
    } finally {
      setLoading(false)
    }
  }

  // OT 날짜부터 출석률 계산 및 정렬
  function sortByAttendanceRate(
    newcomers: NewcomerEducation[],
    schedules: WorshipSchedule[],
  ): NewcomerEducation[] {
    return [...newcomers].sort((a, b) => {
      const rateA = calculateAttendanceRate(a, schedules)
      const rateB = calculateAttendanceRate(b, schedules)
      return rateB - rateA // 높은 순으로 정렬
    })
  }

  // 출석률 계산: OT 날짜부터 현재까지의 출석 비율
  function calculateAttendanceRate(
    newcomer: NewcomerEducation,
    schedules: WorshipSchedule[],
  ): number {
    const educationEntries = Object.entries(newcomer.education).filter(
      ([_, record]) => record !== null,
    )

    // OT 기록 찾기
    const otEntry = educationEntries.find(
      ([_, record]) => record?.lectureType === "OT",
    )
    if (!otEntry) return -1 // OT 없으면 맨 아래로

    const [otDate] = otEntry

    // OT 이후의 스케줄 수 계산 (날짜 기준)
    const schedulesAfterOT = schedules.filter((s) => s.date >= otDate)

    if (schedulesAfterOT.length === 0) return 0

    // 출석 횟수: OT 날짜 이후에 기록이 있는 날짜 수
    const attendedDates = educationEntries.filter(([date]) => date >= otDate)

    return attendedDates.length / schedulesAfterOT.length
  }

  async function handleLectureChange(
    newcomerId: string,
    worshipScheduleId: number,
    lectureType: string,
  ) {
    const cellKey = `${newcomerId}-${worshipScheduleId}`
    setSavingCell(cellKey)

    try {
      await axios.put(`/newcomer/${newcomerId}/education`, {
        lectureType: lectureType || null,
        worshipScheduleId,
      })

      // 로컬 상태 업데이트
      setEducationData((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          newcomers: prev.newcomers.map((newcomer) => {
            if (newcomer.id !== newcomerId) return newcomer

            // 해당 날짜의 스케줄 찾기
            const schedule = prev.worshipSchedules.find(
              (s) => s.id === worshipScheduleId,
            )
            if (!schedule) return newcomer

            const newEducation = { ...newcomer.education }
            if (lectureType) {
              newEducation[schedule.date] = {
                id: "",
                lectureType,
                worshipScheduleId,
                memo: null,
              }
            } else {
              delete newEducation[schedule.date]
            }

            return {
              ...newcomer,
              education: newEducation,
            }
          }),
        }
      })
    } catch (error) {
      console.error("Error saving education data:", error)
      setNotificationMessage("저장 중 오류가 발생했습니다.")
    } finally {
      setSavingCell(null)
    }
  }

  function getLectureValue(
    newcomer: NewcomerEducation,
    worshipScheduleId: number,
  ): string {
    const schedule = educationData?.worshipSchedules.find(
      (s) => s.id === worshipScheduleId,
    )
    if (!schedule) return ""

    const record = newcomer.education[schedule.date]
    return record?.lectureType || ""
  }

  // 해당 새신자가 이미 사용한 강의 타입 목록 (현재 날짜 제외)
  function getUsedLectureTypes(
    newcomer: NewcomerEducation,
    currentScheduleId: number,
  ): string[] {
    const currentSchedule = educationData?.worshipSchedules.find(
      (s) => s.id === currentScheduleId,
    )
    if (!currentSchedule) return []

    return Object.entries(newcomer.education)
      .filter(([date, record]) => {
        if (!record) return false
        // 현재 날짜는 제외 (수정 가능하게)
        if (date === currentSchedule.date) return false
        return true
      })
      .map(([_, record]) => record!.lectureType)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 2 }}>
        <Typography>로딩 중...</Typography>
      </Box>
    )
  }

  if (!educationData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 2 }}>
        <Typography>데이터를 불러올 수 없습니다.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ p: 2 }}>
        {/* 상단 헤더 */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              새신자 교육 현황
            </Typography>
          </CardContent>
        </Card>

        {/* 범례 */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 1.5 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="body2" fontWeight="bold">
                강의:
              </Typography>
              {lectureOptions
                .filter((l) => l.value !== "")
                .map((lecture) => (
                  <Chip
                    key={lecture.value}
                    label={lecture.label}
                    size="small"
                    sx={{
                      bgcolor: lectureColors[lecture.value],
                      fontWeight: "bold",
                    }}
                  />
                ))}
            </Stack>
          </CardContent>
        </Card>

        {/* 출석 테이블 */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2 }}>
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
                  }}
                >
                  <Box
                    sx={{
                      width: NAME_CELL_WIDTH,
                      minWidth: NAME_CELL_WIDTH,
                      maxWidth: NAME_CELL_WIDTH,
                      p: 1,
                      boxSizing: "border-box",
                      borderRight: "1px solid #e0e0e0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      새신자 현황
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={`남 ${educationData.newcomers.filter((n) => n.gender === "man").length}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`여 ${educationData.newcomers.filter((n) => n.gender === "woman").length}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  {educationData.worshipSchedules.map((schedule) => (
                    <Box
                      key={schedule.id}
                      sx={{
                        width: DATE_CELL_WIDTH,
                        minWidth: DATE_CELL_WIDTH,
                        maxWidth: DATE_CELL_WIDTH,
                        p: 1,
                        boxSizing: "border-box",
                        borderRight: "1px solid #e0e0e0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {schedule.date}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Table Body */}
                {educationData.newcomers.map((newcomer) => (
                  <Stack
                    key={newcomer.id}
                    direction="row"
                    sx={{
                      minWidth: "fit-content",
                      bgcolor: "white",
                      borderBottom: "1px solid #e0e0e0",
                      "&:hover": {
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: NAME_CELL_WIDTH,
                        minWidth: NAME_CELL_WIDTH,
                        maxWidth: NAME_CELL_WIDTH,
                        p: 1,
                        boxSizing: "border-box",
                        borderRight: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            newcomer.gender === "man" ? "#1976d2" : "#d32f2f",
                        }}
                      >
                        {newcomer.name} ({newcomer.yearOfBirth || "-"})
                      </Typography>
                    </Box>

                    {educationData.worshipSchedules.map((schedule) => {
                      const currentValue = getLectureValue(
                        newcomer,
                        schedule.id,
                      )
                      const cellKey = `${newcomer.id}-${schedule.id}`
                      const isSaving = savingCell === cellKey
                      const usedLectures = getUsedLectureTypes(
                        newcomer,
                        schedule.id,
                      )

                      return (
                        <Box
                          key={schedule.id}
                          sx={{
                            width: DATE_CELL_WIDTH,
                            minWidth: DATE_CELL_WIDTH,
                            maxWidth: DATE_CELL_WIDTH,
                            p: 1,
                            boxSizing: "border-box",
                            borderRight: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              lectureColors[currentValue] || "transparent",
                            opacity: isSaving ? 0.5 : 1,
                          }}
                        >
                          <Select
                            value={currentValue}
                            onChange={(e) =>
                              handleLectureChange(
                                newcomer.id,
                                schedule.id,
                                e.target.value as string,
                              )
                            }
                            size="small"
                            displayEmpty
                            disabled={isSaving}
                            sx={{
                              width: "100%",
                              height: 32,
                              bgcolor: "transparent",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "& .MuiSelect-select": {
                                py: 0.5,
                                textAlign: "center",
                              },
                            }}
                          >
                            <MenuItem value="">-</MenuItem>
                            {lectureOptions
                              .filter((l) => l.value !== "")
                              .map((lecture) => (
                                <MenuItem
                                  key={lecture.value}
                                  value={lecture.value}
                                  disabled={usedLectures.includes(
                                    lecture.value,
                                  )}
                                >
                                  {lecture.label}
                                </MenuItem>
                              ))}
                          </Select>
                        </Box>
                      )
                    })}
                  </Stack>
                ))}

                {educationData.newcomers.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      등록된 새신자가 없습니다.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

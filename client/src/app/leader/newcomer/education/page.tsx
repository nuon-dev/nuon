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

// 강의 타입별 색상
const lectureColors: Record<string, string> = {
  "": "transparent",
  OT: "#b8f85d",
  "1강": "#fdf171",
  "2강": "#fdf171",
  "3강": "#fdf171",
  "4강": "#fdf171",
  "5강": "#fdf171",
}

const lectureOptions = ["", "OT", "1강", "2강", "3강", "4강", "5강"]

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
      setEducationData(data)
    } catch (error) {
      console.error("Error fetching education data:", error)
    } finally {
      setLoading(false)
    }
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
                .filter((l) => l)
                .map((lecture) => (
                  <Chip
                    key={lecture}
                    label={lecture}
                    size="small"
                    sx={{
                      bgcolor: lectureColors[lecture],
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
                              .filter((l) => l)
                              .map((lecture) => (
                                <MenuItem key={lecture} value={lecture}>
                                  {lecture}
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

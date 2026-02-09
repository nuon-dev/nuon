"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from "@mui/material"
import axios from "@/config/axios"

enum EducationLecture {
  OT = "OT",
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
  L5 = "L5",
}

const LECTURE_ORDER = [
  EducationLecture.L1,
  EducationLecture.L2,
  EducationLecture.L3,
  EducationLecture.L4,
  EducationLecture.L5,
]

const LECTURE_LABELS: Record<string, string> = {
  [EducationLecture.OT]: "OT",
  [EducationLecture.L1]: "1강",
  [EducationLecture.L2]: "2강",
  [EducationLecture.L3]: "3강",
  [EducationLecture.L4]: "4강",
  [EducationLecture.L5]: "5강",
  PROMOTION: "등반 예정",
}

interface WorshipSchedule {
  id: string
  date: string
  lectureType?: string
}

interface NewcomerEducation {
  id: string
  lectureType: EducationLecture
  worshipSchedule?: WorshipSchedule
}

interface Newcomer {
  id: string
  name: string
  status: string
  educationRecords: NewcomerEducation[]
  phone?: string
}

export default function WeeklyAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [newcomers, setNewcomers] = useState<Newcomer[]>([])
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/newcomer?status=NORMAL")
      const data: Newcomer[] = res.data
      setNewcomers(data)
      calculateStats(data)
    } catch (error) {
      console.error("Failed to fetch newcomers", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Newcomer[]) => {
    // Group newcomers by "Next Lecture"
    const groups: Record<string, Newcomer[]> = {
      [EducationLecture.L1]: [],
      [EducationLecture.L2]: [],
      [EducationLecture.L3]: [],
      [EducationLecture.L4]: [],
      [EducationLecture.L5]: [],
      PROMOTION: [],
    }

    data.forEach((nc) => {
      const completed = new Set(nc.educationRecords.map((r) => r.lectureType))
      let nextStep = "PROMOTION"

      for (const lecture of LECTURE_ORDER) {
        if (!completed.has(lecture)) {
          nextStep = lecture
          break
        }
      }
      if (groups[nextStep]) {
        groups[nextStep].push(nc)
      }
    })

    // Build Stats Array for Display
    const displayOrder = [
      EducationLecture.L1,
      EducationLecture.L2,
      EducationLecture.L3,
      EducationLecture.L4,
      EducationLecture.L5,
      "PROMOTION",
    ]

    const calculatedStats = displayOrder.map((step) => {
      const waiting = groups[step] || []
      const count = waiting.length

      return {
        step,
        label: LECTURE_LABELS[step],
        count,
        people: waiting,
      }
    })

    setStats(calculatedStats)
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        주차별 예상 참석자 현황
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={stat.step}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {stat.label}
                </Typography>
                <Chip color="primary" label={`대상: ${stat.count}명`} />
              </Stack>

              <TableContainer
                sx={{
                  maxHeight: 300,
                  border: "1px solid #eee",
                  borderRadius: 1,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell align="right">연락처</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stat.people.length > 0 ? (
                      stat.people.map((person: any) => (
                        <TableRow key={person.id}>
                          <TableCell>{person.name}</TableCell>
                          <TableCell align="right">
                            {person.phone
                              ? person.phone.replace(
                                  /(\d{3})(\d{4})(\d{4})/,
                                  "$1-$2-$3",
                                )
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="caption" color="text.secondary">
                            대상자가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

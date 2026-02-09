import { Box, Stack, Typography } from "@mui/material"

interface WeekData {
  date: string
  male: number
  female: number
  total: number
}

interface AttendanceChartProps {
  data: WeekData[]
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  // 최대값 계산
  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <Stack spacing={2}>
      {data.map((week, index) => (
        <Box key={index}>
          <Typography variant="body2" fontWeight="bold" mb={1}>
            {week.date}
          </Typography>
          <Stack spacing={1}>
            {/* 전체 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption">전체</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {week.total}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 24,
                  bgcolor: "#e0e0e0",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(week.total / maxTotal) * 100}%`,
                    bgcolor: "#2e7d32",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </Box>
            </Box>

            {/* 남성 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption">남성</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {week.male}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 20,
                  bgcolor: "#e3f2fd",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(week.male / maxTotal) * 100}%`,
                    bgcolor: "#1976d2",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </Box>
            </Box>

            {/* 여성 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption">여성</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {week.female}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 20,
                  bgcolor: "#f3e5f5",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(week.female / maxTotal) * 100}%`,
                    bgcolor: "#9c27b0",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

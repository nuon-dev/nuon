"use client"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import axios, { SERVER_FULL_PATH } from "@/config/axios"
import type { BulletinWeek } from "@/types/bulletin"
import { getBulletinWeekTitle } from "@/util/bulletin"

function getCurrentSundayDateString() {
  const today = new Date()
  today.setDate(
    today.getDate() + (today.getDay() === 0 ? 0 : 7 - today.getDay()),
  )
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDefaultExpandedWeekDate(weeks: BulletinWeek[]) {
  const currentSunday = getCurrentSundayDateString()
  return (
    weeks.find((week) => week.weekDate >= currentSunday)?.weekDate ||
    weeks.at(-1)?.weekDate ||
    false
  )
}

export default function BulletinPage() {
  const [bulletinWeeks, setBulletinWeeks] = useState<BulletinWeek[]>([])
  const [expandedWeekDate, setExpandedWeekDate] = useState<string | false>(
    false,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (!expandedWeekDate) {
      return
    }
    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`bulletin-week-images-${expandedWeekDate}`)
        ?.scrollIntoView({ block: "start" })
    }, 250)
    return () => window.clearTimeout(scrollTimer)
  }, [expandedWeekDate])

  async function fetchImages() {
    try {
      const { data } = await axios.get<BulletinWeek[]>("/bulletin")
      const weeks = [...data].sort((a, b) =>
        a.weekDate.localeCompare(b.weekDate),
      )
      setBulletinWeeks(weeks)
      setExpandedWeekDate(getDefaultExpandedWeekDate(weeks))
    } catch (error) {
      console.error("Error fetching bulletin weeks:", error)
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.href = "/link/"
  }

  return (
    <Box sx={{ minHeight: "100svh", bgcolor: "white" }}>
      <IconButton
        aria-label="뒤로 가기"
        onClick={goBack}
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 9999,
          color: "#111",
          bgcolor: "rgba(255,255,255,0.88)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
          "&:hover": {
            bgcolor: "white",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {loading ? (
        <Box
          sx={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : bulletinWeeks.length === 0 ? (
        <Box
          sx={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Typography color="text.secondary">
            등록된 주보 이미지가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 7, pb: 3 }}>
          <Stack spacing={1.5} sx={{ maxWidth: 720, mx: "auto" }}>
            {bulletinWeeks.map((week) => (
              <Accordion
                key={week.weekDate}
                expanded={expandedWeekDate === week.weekDate}
                onChange={(_, expanded) =>
                  setExpandedWeekDate(expanded ? week.weekDate : false)
                }
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={800}>
                    {getBulletinWeekTitle(week.weekDate)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  id={`bulletin-week-images-${week.weekDate}`}
                  sx={{ p: 0, scrollMarginTop: 60 }}
                >
                  {week.images.map((bulletinImage) => (
                    <Box
                      key={`${week.weekDate}-${bulletinImage.slot}`}
                      component="img"
                      src={`${SERVER_FULL_PATH}/bulletin/image/${bulletinImage.filename}`}
                      alt={`${getBulletinWeekTitle(week.weekDate)} ${bulletinImage.slot}`}
                      sx={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        bgcolor: "white",
                      }}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}

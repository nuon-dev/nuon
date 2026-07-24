"use client"

import { useEffect, useRef, useState } from "react"
import { Box, Stack } from "@mui/material"

const DAY_MS = 1000 * 60 * 60 * 24

function getTargetDday() {
  const targetDate = new Date(2026, 7, 14)
  const today = new Date()

  targetDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return Math.max(
    0,
    Math.round((targetDate.getTime() - today.getTime()) / DAY_MS),
  )
}

export default function RetreatMainFourth() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const hasAnimatedRef = useRef(false)
  const targetDday = getTargetDday()
  const [displayedDday, setDisplayedDday] = useState(50)

  const animateDday = () => {
    if (hasAnimatedRef.current) {
      return
    }

    hasAnimatedRef.current = true

    const startValue = 50
    const endValue = targetDday
    const duration = 4000
    const startTime = performance.now()

    const step = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const nextValue = Math.round(
        startValue - (startValue - endValue) * easedProgress,
      )

      setDisplayedDday(nextValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step)
      }
    }

    animationFrameRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    const element = sectionRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          animateDday()
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      },
    )

    observer.observe(element)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      observer.disconnect()
    }
  }, [targetDday])

  return (
    <Stack
      ref={sectionRef}
      width="100%"
      alignItems="center"
      justifyContent="center"
      marginTop="20%"
      gap="24px"
      px={{ xs: 6, md: 8 }}
      sx={{ boxSizing: "border-box" }}
    >
      <img src="/retreat/main/fourth/info.png" width="100%" alt="Content" />
      <Stack
        width="100%"
        position="relative"
        px={{ xs: 0.5, md: 1 }}
        sx={{ boxSizing: "border-box" }}
      >
        <img
          src="/retreat/main/fourth/calendar.png"
          width="100%"
          alt="Calendar"
        />
        <Box
          color="#B89A9E"
          position="absolute"
          right="14%"
          fontSize="10vw"
          fontWeight="bold"
          zIndex={100}
          bottom="7%"
        >
          {`D-${displayedDday}`}
        </Box>
      </Stack>
      <Stack>
        <img src="/retreat/main/fourth/place.png" width="100%" alt="place" />
      </Stack>
    </Stack>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Stack } from "@mui/material"

export default function RetreatMainThird() {
  const thumbWidth = 25
  const imageRefs = useRef<Array<HTMLImageElement | null>>([])
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([])
  const [scrollProgress, setScrollProgress] = useState(0)

  const updateScrollIndicator = () => {
    const element = carouselRef.current

    if (!element) {
      return
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth

    if (maxScrollLeft <= 0) {
      setScrollProgress(0)
      return
    }

    setScrollProgress(element.scrollLeft / maxScrollLeft)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndexes((currentVisible) => {
          const nextVisible = new Set(currentVisible)

          entries.forEach((entry) => {
            const index = Number(entry.target.getAttribute("data-index"))

            if (entry.isIntersecting) {
              nextVisible.add(index)
            }
          })

          return Array.from(nextVisible).sort((left, right) => left - right)
        })
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -12% 0px",
      },
    )

    imageRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    updateScrollIndicator()
    window.addEventListener("resize", updateScrollIndicator)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateScrollIndicator)
    }
  }, [])

  return (
    <Stack
      width="100%"
      alignItems="center"
      justifyContent="center"
      marginTop="20%"
      gap="24px"
      px={{ xs: 6, md: 8 }}
      sx={{ boxSizing: "border-box" }}
    >
      {[
        {
          src: "/retreat/main/third/timetable.png",
          alt: "Timetable",
        },
      ].map((item, index) => (
        <img
          key={item.src}
          ref={(element) => {
            imageRefs.current[index] = element
          }}
          data-index={index}
          src={item.src}
          alt={item.alt}
          width="80%"
          onLoad={updateScrollIndicator}
          style={{
            opacity: visibleIndexes.includes(index) ? 1 : 0,
            transform: visibleIndexes.includes(index)
              ? "translateY(0)"
              : "translateY(24px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        />
      ))}
      <Stack
        ref={carouselRef}
        direction="row"
        alignItems="flex-start"
        gap="24px"
        width="100%"
        marginTop="24px"
        paddingBottom="8px"
        sx={{
          position: "relative",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollPaddingInline: "0px",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        onScroll={updateScrollIndicator}
      >
        <img
          src="/retreat/main/third/table1.png"
          alt="Notice"
          width="100%"
          style={{
            width: "100%",
            minWidth: "100%",
            flex: "0 0 auto",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
        <img
          src="/retreat/main/third/table2.png"
          alt="Notice"
          width="100%"
          style={{
            width: "100%",
            minWidth: "100%",
            flex: "0 0 auto",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
        <img
          src="/retreat/main/third/table3.png"
          alt="Notice"
          width="100%"
          style={{
            width: "100%",
            minWidth: "100%",
            flex: "0 0 auto",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
        <img
          src="/retreat/main/third/table4.png"
          alt="Notice"
          width="100%"
          style={{
            width: "100%",
            minWidth: "100%",
            flex: "0 0 auto",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
      </Stack>
      <Stack
        width="100%"
        px={{ xs: 0.5, md: 1 }}
        sx={{ boxSizing: "border-box" }}
      >
        <div
          style={{
            width: "100%",
            height: "12px",
            borderRadius: "999px",
            background: "#201E1E",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${thumbWidth}%`,
              height: "100%",
              borderRadius: "999px",
              background: "#DAB9BE",
              transform: `translateX(${scrollProgress * thumbWidth * 4 * 3}%)`,
              transition: "transform 0.08s linear, width 0.15s ease",
            }}
          />
        </div>
      </Stack>
    </Stack>
  )
}

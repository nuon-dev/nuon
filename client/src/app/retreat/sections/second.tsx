"use client"

import { useEffect, useRef, useState } from "react"
import { Stack } from "@mui/material"

export default function RetreatMainSecond() {
  const imageRefs = useRef<Array<HTMLImageElement | null>>([])
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([])

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

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Stack
      width="100%"
      alignItems="center"
      justifyContent="center"
      marginTop="20%"
      gap="24px"
    >
      {[
        {
          src: "/retreat/main/second/invitation.png",
          alt: "Invitation",
        },
        {
          src: "/retreat/main/second/content.png",
          alt: "Content",
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
          style={{
            opacity: visibleIndexes.includes(index) ? 1 : 0,
            transform: visibleIndexes.includes(index)
              ? "translateY(0)"
              : "translateY(24px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        />
      ))}
    </Stack>
  )
}

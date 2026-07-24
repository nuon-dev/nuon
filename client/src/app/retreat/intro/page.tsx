"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./page.module.css"
import { Button, Stack } from "@mui/material"
import { useRouter } from "next/navigation"

const texts: Array<{
  text: string
  color: string
  top: string
}> = [
  {
    text: "사울이 길을 가다가\n다메섹에 가까이 이르더니",
    color: "FCF0E3",
    top: "5%",
  },
  {
    text: "홀연히 하늘로부터\n빛이 그를 둘러 비추는지라",
    color: "FCF0E3",
    top: "16%",
  },
  {
    text: "사울아 사울아\n네가 어찌하여 나를 박해하느냐",
    color: "FCF0E3",
    top: "25%",
  },
  {
    text: "주여 누구시니이까 ",
    color: "FCF0E3",
    top: "32%",
  },
  {
    text: "나는 네가 박해하는 예수라",
    color: "E87C7C",
    top: "46.5%",
  },
  {
    text: "너는 일어나 시내로 들어가라 \n네가 행할 것을 \n네게 이를 자가 있느니라",
    color: "363232",
    top: "64%",
  },
]

export default function RetreatIntroPage() {
  const textRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([])
  const { push } = useRouter()

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

    textRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Stack className={styles.page} width="100vw">
      <Stack className={styles.image_wrapper}>
        <img src="/retreat/intro/bg_img.png" className={styles.main_bg} />
        <Stack className={styles.text_overlay}>
          {texts.map((item, index) => (
            <p
              key={item.text}
              ref={(element) => {
                textRefs.current[index] = element
              }}
              data-index={index}
              className={`${styles.text_item} ${
                visibleIndexes.includes(index) ? styles.text_item_visible : ""
              }`}
              style={{
                color: `#${item.color}`,
                top: item.top,
              }}
            >
              {item.text}
            </p>
          ))}
        </Stack>
        <Button
          className={styles.start_button}
          variant="contained"
          onClick={() => {
            push("/retreat")
          }}
          sx={{
            bgcolor: "#EBB8B8",
            color: "#f8efe4",
            "&:hover": {
              bgcolor: "#694444",
            },
          }}
        >
          시작하기
        </Button>
      </Stack>
    </Stack>
  )
}

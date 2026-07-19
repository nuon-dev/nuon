"use client"

import { Button, Stack } from "@mui/material"
import styles from "./page.module.css"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function Postcard() {
  const { push } = useRouter()
  const [cardContentText, setCardContentText] = useState("")

  useEffect(() => {
    const data = localStorage.getItem("postcardData")
    if (data) {
      const parsedData = JSON.parse(data)
      if (parsedData.text) {
        setCardContentText(parsedData.text)
      }
    }
  }, [])

  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    ;(async () => {
      if (imageRef.current) {
        // 이미지가 로드되면 뒷면의 크기를 설정
        while (imageRef.current.clientHeight === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        console.log(
          "imageRef.current.clientWidth",
          imageRef.current.clientWidth,
        )
        console.log(
          "imageRef.current.clientHeight",
          imageRef.current.clientHeight,
        )
      }
    })()
  }, [imageRef.current])

  function CardContent() {
    return (
      <Stack
        className={styles["card-content"]}
        fontFamily="handFont"
        fontSize={15}
      >
        {cardContentText.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </Stack>
    )
  }

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      position="fixed"
      bgcolor="grey.200"
      width="100svw"
      height="100svh"
    >
      <Stack
        position="absolute"
        fontFamily="handFont"
        color="#5D4431"
        fontSize={15}
        className={`${styles.postcard} 
          ${styles["postcard-back"]}`}
      >
        <CardContent />
      </Stack>
      <Button
        variant="contained"
        color="info"
        size="small"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => {
          push("/leader/postcard")
        }}
      >
        돌아가기
      </Button>
    </Stack>
  )
}

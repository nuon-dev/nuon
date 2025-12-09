"use client"

import Image from "next/image"
import { Box, Stack } from "@mui/material"
import styles from "./page.module.css"
import { useEffect, useRef, useState } from "react"

let startPositionX = 0
let startPositionY = 0

let currentRotateX = 0
let currentRotateY = 0

export default function Postcard() {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [backWidth, setBackWidth] = useState(0)
  const [backHeight, setBackHeight] = useState(0)
  const [isNotMove, setIsNotMove] = useState(true)
  const [postContent, setPostContent] = useState("")
  const [fontSize, setFontSize] = useState(0)

  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function touchStart(e: TouchEvent) {
      startPositionX = e.touches[0].clientX + currentRotateY * 2
      startPositionY = e.touches[0].clientY + currentRotateX * 2

      setIsMoving(true)
      setIsNotMove(false)
    }
    addEventListener("touchstart", touchStart)

    function touchMove(e: TouchEvent) {
      const diffX = e.touches[0].clientX - startPositionX
      const diffY = e.touches[0].clientY - startPositionY

      currentRotateX = diffY * -0.5
      currentRotateY = diffX * 0.5

      const isReverse = Math.floor((currentRotateX + 90) / 180) % 2 !== 0
      //뒤집혀 있으면 죄우로 긁었을때, 반대로 움직여야 함
      if (isReverse) {
        currentRotateY = currentRotateY * -1
      }

      setRotateX(currentRotateX)
      setRotateY(currentRotateY)
    }
    addEventListener("touchmove", touchMove)

    function touchEnd() {
      setIsMoving(false)
      const tempRotateX = Math.round(currentRotateX / 180.0)
      currentRotateX = tempRotateX * 180
      setRotateX(currentRotateX)

      const tempRotateY = Math.round(currentRotateY / 180.0)
      currentRotateY = tempRotateY * 180
      setRotateY(currentRotateY)
    }

    addEventListener("touchend", touchEnd)
    return () => {
      removeEventListener("touchstart", touchStart)
      removeEventListener("touchmove", touchMove)
      removeEventListener("touchend", touchEnd)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (imageRef.current) {
        // 이미지가 로드되면 뒷면의 크기를 설정
        while (imageRef.current.clientHeight === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        setFontSize(backHeight / 40)
        setBackWidth(imageRef.current.clientWidth)
        setBackHeight(imageRef.current.clientHeight)
      }
    })()
  }, [imageRef.current])

  useEffect(() => {
    ;(async () => {
      if (!contentRef.current) {
        return
      }
      // 컨텐츠가 로드되면 뒷면의 크기를 설정
      while (
        contentRef.current.clientHeight === 0 ||
        backWidth === 0 ||
        backHeight === 0
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      while (contentRef.current.clientHeight <= backWidth * 0.9) {
        await new Promise((resolve) => setTimeout(resolve, 1))
        setFontSize((pre) => pre * 1.015)
      }
    })()
  }, [contentRef.current])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("postcardData")

      const localStorageData = localStorage.getItem("postcardData")
      if (!localStorageData) {
        return
      }
      const parsedData = JSON.parse(localStorageData)
      if (!parsedData || !parsedData.text) {
        return
      }
      setPostContent(parsedData.text)
    }
  }, [])

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      position="fixed"
      bgcolor="grey.200"
      width="100svw"
      height="100svh"
      style={{
        perspective: "2000px",
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        className={`${styles.postcard} ${
          isNotMove ? styles["moving-animation"] : ""
        }`}
        position="relative"
        style={{
          transitionDuration: isMoving ? "0s" : "0.5s",
          zIndex: 1,
          backfaceVisibility: "hidden",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        <Image
          ref={imageRef}
          className={styles["postcard-image"]}
          alt=""
          src="/postcard_front.png"
          width="0"
          height="0"
        />
        <Stack
          position="absolute"
          style={{
            width: backHeight,
            height: backWidth,
            rotate: "90deg",
          }}
        >
          <Stack
            color="#5D4431"
            fontFamily="handFont"
            fontSize={backHeight / 27}
            position="absolute"
            right={backHeight / 15}
            bottom={backWidth / 5}
          ></Stack>
        </Stack>
      </Stack>
      <Stack
        position="absolute"
        fontFamily="handFont"
        color="#5D4431"
        fontSize={fontSize}
        className={`${styles.postcard} 
          ${styles["postcard-back"]}`}
        display={isNotMove ? "none" : "block"}
        style={{
          width: backHeight,
          height: backWidth,
          transitionDuration: isMoving ? "0s" : "0.5s",
          transform: `rotateX(${rotateX}deg) rotateY(${
            rotateY + 180
          }deg) rotate(90deg)`,
        }}
      >
        <Stack p="24px" pb="0px" whiteSpace="pre" ref={contentRef}>
          {postContent}
        </Stack>
      </Stack>
    </Stack>
  )
}

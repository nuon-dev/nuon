"use client"

import { get } from "@/config/api"
import Image from "next/image"
import { Box, Stack } from "@mui/material"
import styles from "./page.module.css"
import { useAtom } from "jotai"
import numberToString from "./numberToString"
import { RetreatAttendAtom } from "@/state/retreat"
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
  const [retreatAttend, setRetreatAttend] = useAtom(RetreatAttendAtom)

  const imageRef = useRef<HTMLImageElement>(null)

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
        setBackWidth(imageRef.current.clientHeight)
        setBackHeight(imageRef.current.clientWidth)
      }
    })()
  }, [imageRef.current])

  function CardContent() {
    return (
      <>
        {retreatAttend?.user?.name}님 수련회 신청이 완료되었습니다~! <br />
        수련회를 기대하고 기도하는 마음으로 <br />
        같이 준비하면 좋을 거 같아요.
        <br />
        기도로 준비하는 수련회에 <br />
        더 큰 은혜가 있는 건 확실하니까요 :)
        <br /> 새벽이슬도 당신을 위해 기도하겠습니다!
        <br /> 수련회 때 만나요 ♥︎
      </>
    )
  }

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      position="fixed"
      p="50px"
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
          >
            {retreatAttend?.user?.name}님에게 보내는{" "}
            {numberToString(retreatAttend?.attendanceNumber)}번째 편지
          </Stack>
        </Stack>
      </Stack>
      <Stack
        px={backHeight / 100}
        py={backHeight / 150}
        position="absolute"
        fontFamily="handFont"
        color="#5D4431"
        fontSize={backHeight / 15}
        className={`${styles.postcard} 
          ${styles["postcard-back"]}`}
        display={isNotMove ? "none" : "block"}
        style={{
          width: backHeight,
          height: backWidth,
          transitionDuration: isMoving ? "0s" : "0.5s",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY + 180}deg) `,
        }}
      >
        <CardContent />
      </Stack>
    </Stack>
  )
}

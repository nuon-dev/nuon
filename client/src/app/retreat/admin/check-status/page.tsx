"use client"

import { User } from "@server/entity/user"
import { MenuItem, Select, Stack } from "@mui/material"
import { post } from "@/config/api"
import { useEffect, useRef, useState } from "react"
//@ts-ignore
import Quagga from "quagga"
import { CurrentStatus } from "@server/entity/types"

export default function CheckStatus(props: any) {
  const [selectState, setSelectState] = useState(CurrentStatus.null)
  const [user, setUser] = useState<User>({} as any)

  const [barcode, setBarcode] = useState("")

  useEffect(() => {
    startScanner()
  }, [])

  const statusRef = useRef<CurrentStatus>(null)
  useEffect(() => {
    statusRef.current = selectState
  }, [selectState])

  const [isPlay, setPlay] = useState(false)
  useEffect(() => {
    if (isPlay) {
      play()
      setPlay(false)
    }
  }, [isPlay])

  //@ts-ignore
  async function _onDetected(res) {
    setBarcode(res.codeResult.code)

    const response = await post("/status/set", {
      userId: res.codeResult.code,
      status: statusRef.current,
    })

    setUser(response)
    setPlay(true)
  }

  const startScanner = () => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: document.querySelector("#scanner-container"),
          constraints: {
            facingMode: "environment", // or user
          },
        },
        numOfWorkers: navigator.hardwareConcurrency,
        locate: true,
        frequency: 1,
        debug: {
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true,
        },
        multiple: false,
        locator: {
          halfSample: false,
          patchSize: "large", // x-small, small, medium, large, x-large
          debug: {
            showCanvas: true,
            showPatches: false,
            showFoundPatches: false,
            showSkeleton: false,
            showLabels: false,
            showPatchLabels: false,
            showRemainingPatchLabels: false,
            boxFromPatches: {
              showTransformed: false,
              showTransformedBox: false,
              showBB: false,
            },
          },
        },
        decoder: {
          readers: props.readers,
        },
      },
      //@ts-ignore
      (err) => {
        if (err) {
          return console.error(err)
        }
        Quagga.start()
      },
    )
    Quagga.onDetected(_onDetected)
    //@ts-ignore
    Quagga.onProcessed((result) => {
      let drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute("width")),
            parseInt(drawingCanvas.getAttribute("height")),
          )
          result.boxes
            //@ts-ignore
            .filter((box) => box !== result.box)
            //@ts-ignore
            .forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: "green",
                lineWidth: 2,
              })
            })
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2,
          })
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: "x", y: "y" },
            drawingCtx,
            { color: "red", lineWidth: 3 },
          )
        }
      }
    })
  }

  const stopScanner = () => {
    return
    Quagga.offProcessed()
    Quagga.offDetected()
    Quagga.stop()
  }

  function play() {
    const audio = new Audio("/scan_alert.mp3")
    audio.play()
  }

  return (
    <Stack padding="24px" gap="24px">
      <Select
        onChange={(e) => setSelectState(e.target.value as CurrentStatus)}
        value={selectState}
      >
        <MenuItem value={CurrentStatus.null}>초기화</MenuItem>
        <MenuItem value={CurrentStatus.arriveChurch}>교회 도착</MenuItem>
        <MenuItem value={CurrentStatus.arriveAuditorium}>
          수련회장 도착
        </MenuItem>
      </Select>
      <div
        id="scanner-container"
        style={{
          position: "relative",
        }}
      />
      <span>Barcode: {barcode}</span>
      {user.name && (
        <Stack>
          {user.name}[{user.yearOfBirth}]
        </Stack>
      )}
    </Stack>
  )
}

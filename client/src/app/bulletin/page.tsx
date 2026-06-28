"use client"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Box, CircularProgress, IconButton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import axios, { SERVER_FULL_PATH } from "@/config/axios"
import type { BulletinImage } from "@/types/bulletin"

export default function BulletinPage() {
  const [bulletinImages, setBulletinImages] = useState<BulletinImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      const { data } = await axios.get<BulletinImage[]>("/bulletin")
      setBulletinImages(data)
    } catch (error) {
      console.error("Error fetching bulletin images:", error)
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
      ) : bulletinImages.length === 0 ? (
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
        <Box>
          {bulletinImages.map((bulletinImage) => (
            <Box
              key={bulletinImage.slot}
              component="img"
              src={`${SERVER_FULL_PATH}/bulletin/image/${bulletinImage.filename}`}
              alt={`주일 주보 ${bulletinImage.slot}`}
              sx={{
                width: "100%",
                maxWidth: 720,
                height: "auto",
                mx: "auto",
                display: "block",
                bgcolor: "white",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

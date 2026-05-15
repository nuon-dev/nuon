"use client"

import { Stack, Box, CircularProgress, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "@server/entity/link"
import LinkCard from "@/app/components/LinkCard"
import LinkDetailModal from "@/app/components/LinkDetailModal"

export default function Index() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    try {
      setLoading(true)
      const response = await axios.get("/link")
      const sortedLinks = response.data.sort(
        (a: Link, b: Link) => a.displayOrder - b.displayOrder,
      )
      setLinks(sortedLinks)
    } catch (error) {
      console.error("Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCardClick(link: Link) {
    if (link.type === "link" && link.url) {
      window.open(link.url, "_blank")
    } else {
      setSelectedLink(link)
      setOpenModal(true)
    }

    // 링크 클릭 기록
    try {
      await axios.post(`/link/${link.id}/click`, {
        userAgent: navigator.userAgent,
      })
    } catch (error) {
      console.error("Error recording click:", error)
    }
  }

  async function handleOpenLink(link: Link) {
    if (link.type === "link" && link.url) {
      window.open(link.url, "_blank")
    }
  }

  function handleCloseModal() {
    setOpenModal(false)
    setTimeout(() => setSelectedLink(null), 300)
  }

  return (
    <Stack sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3 },
          py: 4,
          maxWidth: 680,
          mx: "auto",
          width: "100%",
          boxSizing: "border-box", // 가로 스크롤 방지
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress />
          </Box>
        ) : links.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              p: 8,
              color: "#999",
              fontSize: "1.1rem",
            }}
          >
            등록된 링크가 없습니다.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onClick={handleCardClick} />
            ))}
          </Stack>
        )}
      </Box>

      <LinkDetailModal
        open={openModal}
        link={selectedLink}
        onClose={handleCloseModal}
        onOpenLink={handleOpenLink}
      />
    </Stack>
  )
}

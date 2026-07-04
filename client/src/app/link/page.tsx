"use client"

import { Stack, Box, CircularProgress, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import LinkCard from "@/app/components/LinkCard"
import LinkDetailModal from "@/app/components/LinkDetailModal"
import axios from "@/config/axios"
import type { Link, LinkListItem } from "@/types/link"

const sundayBulletinLink: LinkListItem = {
  id: "sunday-bulletin",
  title: "주일 주보",
  type: "link",
  url: "/bulletin/",
}

function addSundayBulletinLink(links: LinkListItem[]) {
  const hasSundayBulletin = links.some(
    (link) => link.title === "주일 주보" || link.url === "/bulletin/",
  )
  if (hasSundayBulletin) {
    return links
  }

  const monthlySheetMusicIndex = links.findIndex(
    (link) => link.title === "월기 악보",
  )
  const insertAt = monthlySheetMusicIndex < 0 ? 0 : monthlySheetMusicIndex

  return [
    ...links.slice(0, insertAt),
    sundayBulletinLink,
    ...links.slice(insertAt),
  ]
}

export default function Index() {
  const [links, setLinks] = useState<LinkListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLink, setSelectedLink] = useState<LinkListItem | null>(null)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    try {
      setLoading(true)
      const response = await axios.get<Link[]>("/link")
      const sortedLinks = response.data.sort(
        (a: Link, b: Link) => a.displayOrder - b.displayOrder,
      )
      setLinks(addSundayBulletinLink(sortedLinks))
    } catch (error) {
      console.error("Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }

  function openLink(link: LinkListItem) {
    if (!link.url) {
      return
    }
    if (link.url.startsWith("/")) {
      window.location.href = link.url
      return
    }
    window.open(link.url, "_blank", "noopener,noreferrer")
  }

  async function handleCardClick(link: LinkListItem) {
    if (link.type === "link" && link.url) {
      openLink(link)
    } else {
      setSelectedLink(link)
      setOpenModal(true)
    }

    // 링크 클릭 기록
    if (link.id === sundayBulletinLink.id) {
      return
    }
    try {
      await axios.post(`/link/${link.id}/click`, {
        userAgent: navigator.userAgent,
      })
    } catch (error) {
      console.error("Error recording click:", error)
    }
  }

  async function handleOpenLink(link: LinkListItem) {
    if (link.type === "link" && link.url) {
      openLink(link)
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

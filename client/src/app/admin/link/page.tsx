"use client"

import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material"
import { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { useNotification } from "@/hooks/useNotification"
import axios from "@/config/axios"
import LinkIcon from "@mui/icons-material/Link"
import LinkTable, { Link } from "./components/LinkTable"
import LinkDialog from "./components/LinkDialog"

export default function LinkManagePage() {
  const { error, success } = useNotification()
  const [linkList, setLinkList] = useState<Link[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [selectedLink, setSelectedLink] = useState<Link>({
    title: "",
    type: "link",
    url: "",
    body: "",
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    try {
      const { data } = await axios.get("/link")
      setLinkList(data)
    } catch (err) {
      error("링크 목록을 불러올 수 없습니다.")
    }
  }

  function openAddDialog() {
    setSelectedLink({
      title: "",
      type: "link",
      url: "",
      body: "",
      displayOrder: 0,
      isActive: true,
    })
    setIsEditing(false)
    setOpenDialog(true)
  }

  function openEditDialog(link: Link) {
    setSelectedLink({ ...link })
    setIsEditing(true)
    setOpenDialog(true)
  }

  async function saveLink() {
    if (!selectedLink.title) {
      error("제목을 입력해주세요.")
      return
    }
    if (selectedLink.type === "link" && !selectedLink.url) {
      error("링크 타입일 때 URL을 입력해주세요.")
      return
    }
    if (selectedLink.type === "text" && !selectedLink.body) {
      error("텍스트 타입일 때 내용을 입력해주세요.")
      return
    }

    try {
      if (isEditing && selectedLink.id) {
        await axios.put(`/link/${selectedLink.id}`, selectedLink)
        success("링크가 수정되었습니다.")
      } else {
        await axios.post("/link", selectedLink)
        success("링크가 추가되었습니다.")
      }
      await fetchLinks()
      setOpenDialog(false)
    } catch (err) {
      error("링크 저장에 실패했습니다.")
    }
  }

  async function deleteLink(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await axios.delete(`/link/${id}`)
      success("링크가 삭제되었습니다.")
      await fetchLinks()
    } catch (err) {
      error("링크 삭제에 실패했습니다.")
    }
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <LinkIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Typography variant="h5" fontWeight="bold">
                  링크 관리
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
              >
                링크 추가
              </Button>
            </Stack>

            <LinkTable
              linkList={linkList}
              onEdit={openEditDialog}
              onDelete={deleteLink}
            />
          </Stack>
        </CardContent>
      </Card>

      <LinkDialog
        open={openDialog}
        isEditing={isEditing}
        selectedLink={selectedLink}
        onClose={() => setOpenDialog(false)}
        onSave={saveLink}
        onChange={setSelectedLink}
      />
    </Box>
  )
}

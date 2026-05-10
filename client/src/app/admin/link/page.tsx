"use client"

import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
  CardContent,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TableContainer,
  MenuItem,
} from "@mui/material"
import { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { useNotification } from "@/hooks/useNotification"
import axios from "@/config/axios"
import LinkIcon from "@mui/icons-material/Link"

interface Link {
  id?: string
  title: string
  type: "link" | "text"
  url?: string
  body?: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

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

            {linkList.length === 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center", py: 3 }}
              >
                추가된 링크가 없습니다.
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>순서</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell>타입</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell align="center">활성</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {linkList.map((link) => (
                      <TableRow key={link.id} hover>
                        <TableCell>{link.displayOrder}</TableCell>
                        <TableCell>{link.title}</TableCell>
                        <TableCell>
                          {link.type === "link" ? "🔗 링크" : "📝 텍스트"}
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={link.url}
                        >
                          {link.url || "—"}
                        </TableCell>
                        <TableCell align="center">
                          {link.isActive ? "✓" : "✗"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(link)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => link.id && deleteLink(link.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{isEditing ? "링크 수정" : "링크 추가"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="제목"
              fullWidth
              value={selectedLink.title}
              onChange={(e) =>
                setSelectedLink({ ...selectedLink, title: e.target.value })
              }
              placeholder="링크 제목을 입력하세요"
            />
            <TextField
              select
              label="타입"
              fullWidth
              value={selectedLink.type}
              onChange={(e) =>
                setSelectedLink({
                  ...selectedLink,
                  type: e.target.value as "link" | "text",
                  url: e.target.value === "text" ? "" : selectedLink.url,
                })
              }
            >
              <MenuItem value="link">🔗 링크</MenuItem>
              <MenuItem value="text">📝 텍스트</MenuItem>
            </TextField>
            {selectedLink.type === "link" && (
              <TextField
                label="URL"
                fullWidth
                value={selectedLink.url || ""}
                onChange={(e) =>
                  setSelectedLink({ ...selectedLink, url: e.target.value })
                }
                placeholder="https://example.com"
              />
            )}
            {selectedLink.type === "text" && (
              <TextField
                label="내용"
                fullWidth
                multiline
                rows={4}
                value={selectedLink.body || ""}
                onChange={(e) =>
                  setSelectedLink({ ...selectedLink, body: e.target.value })
                }
                placeholder="텍스트 내용을 입력하세요"
              />
            )}
            <TextField
              label="표시 순서"
              type="number"
              fullWidth
              value={selectedLink.displayOrder}
              onChange={(e) =>
                setSelectedLink({
                  ...selectedLink,
                  displayOrder: parseInt(e.target.value),
                })
              }
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="checkbox"
                checked={selectedLink.isActive}
                onChange={(e) =>
                  setSelectedLink({
                    ...selectedLink,
                    isActive: e.target.checked,
                  })
                }
              />
              <Typography variant="body2">활성화</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={saveLink} variant="contained" color="primary">
            {isEditing ? "수정" : "추가"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

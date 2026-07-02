"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import UploadIcon from "@mui/icons-material/Upload"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import axios, { SERVER_FULL_PATH } from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"
import type { BulletinImage, BulletinImageSlot } from "@/types/bulletin"

const bulletinImageSlots: BulletinImageSlot[] = [1, 2]

function getBulletinImageTitle(slot: BulletinImageSlot) {
  return slot === 1 ? "첫 번째 주보 이미지" : "두 번째 주보 이미지"
}

export default function AdminBulletinPage() {
  const { success, error } = useNotification()
  const [bulletinImages, setBulletinImages] = useState<BulletinImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingImageSlot, setUploadingImageSlot] =
    useState<BulletinImageSlot | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      setLoading(true)
      const { data } = await axios.get<BulletinImage[]>("/bulletin")
      setBulletinImages(data)
    } catch (err) {
      error("주보 이미지를 불러올 수 없습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function uploadImageToSlot(
    slot: BulletinImageSlot,
    file: File | undefined,
  ) {
    if (!file) {
      return
    }

    try {
      setUploadingImageSlot(slot)
      const formData = new FormData()
      formData.append("image", file)
      await axios.put(`/bulletin/${slot}`, formData)
      await fetchImages()
      success("주보 이미지가 업로드되었습니다.")
    } catch (err) {
      error("주보 이미지 업로드에 실패했습니다.")
    } finally {
      setUploadingImageSlot(null)
    }
  }

  async function deleteImageFromSlot(slot: BulletinImageSlot) {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await axios.delete(`/bulletin/${slot}`)
      await fetchImages()
      success("주보 이미지가 삭제되었습니다.")
    } catch (err) {
      error("주보 이미지 삭제에 실패했습니다.")
    }
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Stack spacing={2} sx={{ maxWidth: 980, mx: "auto" }}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={800}>
              주보 관리
            </Typography>
          </CardContent>
        </Card>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {bulletinImageSlots.map((slot) => {
              const bulletinImage = bulletinImages.find(
                (item) => item.slot === slot,
              )
              const uploading = uploadingImageSlot === slot

              return (
                <Card key={slot}>
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      {bulletinImage ? (
                        <Box
                          component="img"
                          src={`${SERVER_FULL_PATH}/bulletin/image/${bulletinImage.filename}`}
                          alt={getBulletinImageTitle(slot)}
                          sx={{
                            width: 88,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 1,
                            bgcolor: "#f5f5f5",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 88,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1,
                            bgcolor: "#f5f5f5",
                          }}
                        >
                          <Typography color="text.secondary">미등록</Typography>
                        </Box>
                      )}

                      <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700}>
                          {getBulletinImageTitle(slot)}
                        </Typography>
                        <Typography color="text.secondary" noWrap>
                          {uploading
                            ? "업로드 중..."
                            : bulletinImage?.originalName ||
                              "등록된 이미지가 없습니다."}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: "flex-end", sm: "flex-start" }}
                      >
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<UploadIcon />}
                          disabled={uploading}
                        >
                          {bulletinImage ? "이미지 교체" : "이미지 업로드"}
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              uploadImageToSlot(
                                slot,
                                event.target.files?.[0],
                              )
                              event.target.value = ""
                            }}
                          />
                        </Button>
                        {bulletinImage && (
                          <IconButton
                            color="error"
                            aria-label={`${getBulletinImageTitle(slot)} 삭제`}
                            onClick={() => deleteImageFromSlot(slot)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

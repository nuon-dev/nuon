"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import UploadIcon from "@mui/icons-material/Upload"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  IconButton,
  TextField,
  Stack,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import axios, { SERVER_FULL_PATH } from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"
import type {
  AdminBulletinResponse,
  BulletinImageSlot,
  BulletinWeek,
} from "@/types/bulletin"
import { getBulletinWeekTitle } from "@/util/bulletin"

const bulletinImageSlots: BulletinImageSlot[] = [1, 2]

interface UploadingBulletinImage {
  weekDate: string
  slot: BulletinImageSlot
}

function getBulletinImageTitle(slot: BulletinImageSlot) {
  return slot === 1 ? "첫 번째 주보 이미지" : "두 번째 주보 이미지"
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

function getBulletinDateLabel(weekDate: string) {
  return new Date(`${weekDate}T00:00:00`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

export default function AdminBulletinPage() {
  const { success, error } = useNotification()
  const [bulletinWeeks, setBulletinWeeks] = useState<BulletinWeek[]>([])
  const [nextWeekDate, setNextWeekDate] = useState("")
  const [selectedWeekDate, setSelectedWeekDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] =
    useState<UploadingBulletinImage | null>(null)

  const weekDateOptions = Array.from(
    new Set([
      ...bulletinWeeks.map((week) => week.weekDate),
      ...Array.from({ length: 16 }, (_, index) =>
        nextWeekDate ? addDays(nextWeekDate, (index - 4) * 7) : "",
      ).filter(Boolean),
    ]),
  ).sort((a, b) => a.localeCompare(b))
  const selectedWeek = bulletinWeeks.find(
    (week) => week.weekDate === selectedWeekDate,
  ) || { weekDate: selectedWeekDate, images: [] }

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      setLoading(true)
      const { data } = await axios.get<AdminBulletinResponse>("/admin/bulletin")
      setBulletinWeeks(data.weeks)
      setNextWeekDate(data.nextWeekDate)
      setSelectedWeekDate((current) => current || data.nextWeekDate)
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        return
      }
      error("주보 이미지를 불러올 수 없습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function uploadImageToSlot(
    weekDate: string,
    slot: BulletinImageSlot,
    file: File | undefined,
  ) {
    if (!file) {
      return
    }

    try {
      setUploadingImage({ weekDate, slot })
      const formData = new FormData()
      formData.append("image", file)
      await axios.put(`/admin/bulletin/${weekDate}/${slot}`, formData)
      await fetchImages()
      success("주보 이미지가 업로드되었습니다.")
    } catch (err) {
      error("주보 이미지 업로드에 실패했습니다.")
    } finally {
      setUploadingImage(null)
    }
  }

  async function deleteImageFromSlot(weekDate: string, slot: BulletinImageSlot) {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await axios.delete(`/admin/bulletin/${weekDate}/${slot}`)
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
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="주보 날짜"
                    value={selectedWeekDate}
                    onChange={(event) => setSelectedWeekDate(event.target.value)}
                    sx={{ maxWidth: 320 }}
                  >
                    {weekDateOptions.map((weekDate) => (
                      <MenuItem key={weekDate} value={weekDate}>
                        {getBulletinDateLabel(weekDate)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Stack>
                    <Typography variant="h6" fontWeight={800}>
                      {getBulletinWeekTitle(selectedWeek.weekDate)}
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedWeek.weekDate}
                    </Typography>
                  </Stack>

                  {bulletinImageSlots.map((slot) => {
                    const bulletinImage = selectedWeek.images.find(
                      (item) => item.slot === slot,
                    )
                    const uploading =
                      uploadingImage?.weekDate === selectedWeek.weekDate &&
                      uploadingImage.slot === slot

                    return (
                      <Stack
                        key={`${selectedWeek.weekDate}-${slot}`}
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        {bulletinImage ? (
                          <Box
                            component="img"
                            src={`${SERVER_FULL_PATH}/bulletin/image/${bulletinImage.filename}`}
                            alt={`${getBulletinWeekTitle(selectedWeek.weekDate)} ${getBulletinImageTitle(slot)}`}
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
                          justifyContent={{
                            xs: "flex-end",
                            sm: "flex-start",
                          }}
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
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={(event) => {
                                uploadImageToSlot(
                                  selectedWeek.weekDate,
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
                              aria-label={`${getBulletinWeekTitle(selectedWeek.weekDate)} ${getBulletinImageTitle(slot)} 삭제`}
                              onClick={() =>
                                deleteImageFromSlot(selectedWeek.weekDate, slot)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    )
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

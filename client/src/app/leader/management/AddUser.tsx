"use client"

import {
  Button,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Fade,
  Alert,
} from "@mui/material"
import { post } from "@/config/api"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import SaveIcon from "@mui/icons-material/Save"

interface AddUserProps {
  onClose: () => void
}

export default function AddUser({ onClose }: AddUserProps) {
  const [userName, setUserName] = useState("")
  const [yearOfBirth, setYearOfBirth] = useState("")
  const [gender, setGender] = useState("man")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!userName || !yearOfBirth || !gender || !phone) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await post("/soon/add-user", {
        userName,
        yearOfBirth,
        gender,
        phone,
      })
      onClose()
    } catch (err) {
      setError("순원 추가 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1, sm: 2 }, // 모바일에서 패딩 줄임
      }}
    >
      <Fade in={true}>
        <Card
          sx={{
            minWidth: { xs: "calc(100vw - 32px)", sm: 400 }, // 모바일에서 좌우 여백 16px씩
            maxWidth: { xs: "calc(100vw - 32px)", sm: 500 },
            width: "100%",
            maxHeight: { xs: "calc(100vh - 32px)", sm: "90vh" }, // 모바일에서 상하 여백 16px씩
            overflow: "auto",
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* 헤더 */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                p: { xs: 2, sm: 3 }, // 모바일에서 패딩 줄임
                position: "relative",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <PersonAddIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />{" "}
                {/* 모바일에서 아이콘 크기 줄임 */}
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  순원 추가
                </Typography>
              </Stack>
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: { xs: 4, sm: 8 }, // 모바일에서 위치 조정
                  top: { xs: 4, sm: 8 },
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 폼 내용 */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {" "}
              {/* 모바일에서 패딩 줄임 */}
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error" onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                <TextField
                  label="이름"
                  variant="outlined"
                  fullWidth
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  size={window.innerWidth < 600 ? "medium" : "medium"} // 모바일에서도 충분한 크기
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                <TextField
                  label="출생년도"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={yearOfBirth}
                  onChange={(e) => setYearOfBirth(e.target.value)}
                  placeholder="예: 1995"
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                >
                  <InputLabel>성별</InputLabel>
                  <Select
                    value={gender}
                    label="성별"
                    onChange={(e) => setGender(e.target.value as string)}
                  >
                    <MenuItem value="man">남성</MenuItem>
                    <MenuItem value="woman">여성</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="전화번호"
                  variant="outlined"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/-/g, ""))}
                  placeholder="01012345678"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                {/* 버튼들 */}
                <Stack
                  direction={{ xs: "column", sm: "row" }} // 모바일에서는 세로로 배치
                  spacing={2}
                  sx={{ pt: 2 }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onClose}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: "#ddd",
                      color: "#666",
                      "&:hover": {
                        borderColor: "#bbb",
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background:
                        "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                      boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                        boxShadow: "0 6px 20px rgba(255, 105, 135, .4)",
                      },
                      "&:disabled": {
                        background: "#ccc",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {loading ? "저장 중..." : "저장하기"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  )
}

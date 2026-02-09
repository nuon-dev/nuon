"use client"

import { useEffect, useState } from "react"
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { HowToMove } from "@server/entity/types"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { get } from "@/config/api"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"
import FileDownloadIcon from "@mui/icons-material/FileDownload"

function AllUser() {
  const router = useRouter()
  const [allUserList, setAllUserList] = useState<Array<RetreatAttend>>([])
  const { error, success } = useNotification()

  useEffect(() => {
    ;(async () => {
      try {
        const list: RetreatAttend[] = await get("/retreat/admin/get-all-user")
        if (list) {
          setAllUserList(
            list.sort((a, b) => a.attendanceNumber - b.attendanceNumber),
          )
        }
      } catch {
        router.push("/retreat/admin")
        error("권한이 없습니다.")
        return
      }
    })()
  }, [])

  function downloadFile() {
    if (allUserList.length === 0) {
      error("접수자가 없습니다!.")
      return
    }

    const keys = Object.keys(allUserList[0])
    var textToSave = allUserList
      .map((user) => Object.values(user).join(","))
      .join("\n")

    var hiddenElement = document.createElement("a")
    hiddenElement.href =
      "data:attachment/text," + encodeURI(keys + "\n" + textToSave)
    hiddenElement.target = "_blank"
    hiddenElement.download = "전체 접수자.csv"
    hiddenElement.click()

    get("/retreat/admin/get-car-info").then((data: InOutInfo[]) => {
      var hiddenElement = document.createElement("a")
      hiddenElement.href =
        "data:attachment/text," + encodeURI(JSON.stringify(data))
      hiddenElement.target = "_blank"
      hiddenElement.download = "출입 정보.txt"
      hiddenElement.click()
    })

    success("다운로드가 완료되었습니다.")
  }

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "2000px", mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          mb={4}
        >
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: { xs: "28px", md: "40px" },
              color: "#0a0a0a",
              letterSpacing: "-0.8px",
            }}
          >
            전체 접수자 목록
          </Typography>

          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={downloadFile}
            sx={{
              textTransform: "none",
              borderRadius: "6px",
              px: 3,
              py: 1.2,
              fontWeight: "700",
              bgcolor: "#42C7F1",
              "&:hover": {
                bgcolor: "#2BA8D4",
              },
            }}
          >
            CSV 다운로드
          </Button>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "8px",
            border: "1.5px solid rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#f8f9fa",
                    borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    접수 번호
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    이름
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    성별
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    나이
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    가는 방법
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#0a0a0a",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      fontSize: "15px",
                      letterSpacing: "-0.2px",
                      py: 2,
                    }}
                  >
                    오는 방법
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUserList.map((retreatAttend, index) => (
                  <TableRow
                    key={retreatAttend.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "rgba(66, 199, 241, 0.08)",
                      },
                      "&:nth-of-type(odd)": {
                        bgcolor: "rgba(66, 199, 241, 0.03)",
                      },
                      borderColor: "rgba(0, 0, 0, 0.08)",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#0a0a0a",
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        py: 1.5,
                      }}
                    >
                      {retreatAttend.attendanceNumber}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {retreatAttend.user.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {retreatAttend.user.gender === "man" ? "남" : "여"}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {retreatAttend.user.yearOfBirth}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {retreatAttend.howToGo === HowToMove.together
                        ? "교회 버스"
                        : "기타"}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: "rgba(0, 0, 0, 0.08)",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {retreatAttend.howToBack === HowToMove.together
                        ? "교회 버스"
                        : "기타"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default AllUser

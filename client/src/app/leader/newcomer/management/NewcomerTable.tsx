import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Stack,
} from "@mui/material"

interface Newcomer {
  id: string
  name: string
  yearOfBirth: number | null
  birthday?: string | null
  phone: string | null
  gender: "man" | "woman" | "" | null
  status: string
  createdAt: string
  registrationDate?: string | null
  deletedAt?: string | null
  pendingDate?: string | null
  promotionDate?: string | null
}

interface NewcomerTableProps {
  newcomerList: Newcomer[]
  filteredNewcomerList: Newcomer[]
  orderProperty: string
  direction: "asc" | "desc"
  onSortClick: (property: string) => void
  onNewcomerSelect: (newcomer: any) => void
}

export default function NewcomerTable({
  newcomerList,
  filteredNewcomerList,
  orderProperty,
  direction,
  onSortClick,
  onNewcomerSelect,
}: NewcomerTableProps) {
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "NORMAL":
        return "활동중"
      case "PROMOTED":
        return "등반"
      case "PENDING":
        return "보류"
      case "DELETED":
        return "삭제"
      default:
        return ""
    }
  }

  return (
    <Stack
      width="50%"
      flex={1}
      border="1px solid #ccc"
      maxHeight="calc(100vh - 100px)"
      overflow="auto"
    >
      <Box p="8px" bgcolor="#f5f5f5" fontSize="14px">
        총 {filteredNewcomerList.length}명 (전체 {newcomerList.length}명)
      </Box>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "name"}
                direction={direction}
                onClick={() => onSortClick("name")}
              >
                이름
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "gender"}
                direction={direction}
                onClick={() => onSortClick("gender")}
              >
                성별
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "yearOfBirth"}
                direction={direction}
                onClick={() => onSortClick("yearOfBirth")}
              >
                생년
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "phone"}
                direction={direction}
                onClick={() => onSortClick("phone")}
              >
                전화번호
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "status"}
                direction={direction}
                onClick={() => onSortClick("status")}
              >
                상태
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderProperty === "registrationDate"}
                direction={direction}
                onClick={() => onSortClick("registrationDate")}
              >
                등록일
              </TableSortLabel>
            </TableCell>
            <TableCell>보류일</TableCell>
            <TableCell>등반일</TableCell>
            <TableCell>삭제일</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredNewcomerList.map((newcomer) => (
            <TableRow
              key={newcomer.id}
              onClick={() => onNewcomerSelect(newcomer)}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>{newcomer.name}</TableCell>
              <TableCell>
                {newcomer.gender === "man"
                  ? "남"
                  : newcomer.gender === "woman"
                    ? "여"
                    : ""}
              </TableCell>
              <TableCell>
                {newcomer.yearOfBirth === null || newcomer.yearOfBirth === 0
                  ? ""
                  : newcomer.yearOfBirth}
              </TableCell>
              <TableCell>{newcomer.phone || ""}</TableCell>
              <TableCell>{getStatusLabel(newcomer.status)}</TableCell>
              <TableCell>
                {newcomer.registrationDate || newcomer.createdAt
                  ? new Date(
                      newcomer.registrationDate || newcomer.createdAt,
                    ).toLocaleDateString("ko-KR")
                  : ""}
              </TableCell>
              <TableCell>
                {newcomer.pendingDate
                  ? new Date(newcomer.pendingDate).toLocaleDateString("ko-KR")
                  : ""}
              </TableCell>
              <TableCell>
                {newcomer.promotionDate
                  ? new Date(newcomer.promotionDate).toLocaleDateString("ko-KR")
                  : ""}
              </TableCell>
              <TableCell>
                {newcomer.deletedAt
                  ? new Date(newcomer.deletedAt).toLocaleDateString("ko-KR")
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}

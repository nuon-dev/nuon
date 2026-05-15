import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

export interface Link {
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

interface LinkTableProps {
  linkList: Link[]
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}

export default function LinkTable({
  linkList,
  onEdit,
  onDelete,
}: LinkTableProps) {
  if (linkList.length === 0) {
    return (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ textAlign: "center", py: 3 }}
      >
        추가된 링크가 없습니다.
      </Typography>
    )
  }

  return (
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
              <TableCell align="center">{link.isActive ? "✓" : "✗"}</TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onEdit(link)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => link.id && onDelete(link.id)}
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
  )
}

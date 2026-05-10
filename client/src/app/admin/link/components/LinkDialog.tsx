import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { Link } from "./LinkTable"

interface LinkDialogProps {
  open: boolean
  isEditing: boolean
  selectedLink: Link
  onClose: () => void
  onSave: () => void
  onChange: (link: Link) => void
}

export default function LinkDialog({
  open,
  isEditing,
  selectedLink,
  onClose,
  onSave,
  onChange,
}: LinkDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isEditing ? "링크 수정" : "링크 추가"}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="제목"
            fullWidth
            value={selectedLink.title}
            onChange={(e) =>
              onChange({ ...selectedLink, title: e.target.value })
            }
            placeholder="링크 제목을 입력하세요"
          />
          <TextField
            select
            label="타입"
            fullWidth
            value={selectedLink.type}
            onChange={(e) =>
              onChange({
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
                onChange({ ...selectedLink, url: e.target.value })
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
                onChange({ ...selectedLink, body: e.target.value })
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
              onChange({
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
                onChange({
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
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          {isEditing ? "수정" : "추가"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

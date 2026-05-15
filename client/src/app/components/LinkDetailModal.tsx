import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material"
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material"
import { Link } from "@server/entity/link"

interface LinkDetailModalProps {
  open: boolean
  link: Link | null
  onClose: () => void
  onOpenLink: (link: Link) => void
}

export default function LinkDetailModal({
  open,
  link,
  onClose,
  onOpenLink,
}: LinkDetailModalProps) {
  if (!link) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        timeout: 400,
      }}
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "white",
          color: "#111",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "1rem",
          py: 2,
          px: 2.5,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.95rem",
          }}
        >
          {link.type === "link" ? "🔗" : "📝"}
          {link.title}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#999",
            p: 0.5,
            bgcolor: "#f5f5f5",
            "&:hover": { bgcolor: "#eee" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5, pb: 3, px: 2.5 }}>
        {link.type === "link" && link.url && (
          <Box sx={{ mb: 1, mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 2.5,
                wordBreak: "break-all",
                fontSize: "0.85rem",
                bgcolor: "#f9f9f9",
                p: 1.5,
                borderRadius: "10px",
              }}
            >
              {link.url}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onOpenLink(link)
                onClose()
              }}
              sx={{
                bgcolor: "#111",
                color: "white",
                borderRadius: "24px",
                fontWeight: 600,
                py: 1.2,
                fontSize: "0.9rem",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#333",
                  boxShadow: "none",
                },
              }}
              endIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
            >
              이동하기
            </Button>
          </Box>
        )}
        {link.type === "text" && link.body && (
          <Box sx={{ mt: 1 }}>
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                color: "#333",
                fontSize: "0.9rem",
                bgcolor: "#f9f9f9",
                p: 2,
                borderRadius: "12px",
              }}
            >
              {link.body}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

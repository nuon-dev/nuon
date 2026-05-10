import { Box, Card, Typography } from "@mui/material"
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material"
import { Link } from "@server/entity/link"

interface LinkCardProps {
  link: Link
  onClick: (link: Link) => void
}

export default function LinkCard({ link, onClick }: LinkCardProps) {
  return (
    <Card
      onClick={() => onClick(link)}
      sx={{
        cursor: "pointer",
        borderRadius: "30px", // 링크트리 스타일 둥근 버튼 모양
        boxShadow: "none",
        border: "1px solid transparent",
        bgcolor: "white",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.06)",
          border: "1px solid #e0e0e0",
        },
      }}
    >
      <Box
        sx={{
          p: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "40px",
        }}
      >
        {/* 좌측 여백/아이콘 - 균형 맞추기용 */}
        <Box
          sx={{
            width: 28,
            display: "flex",
            justifyContent: "flex-start",
            fontSize: "0.9rem",
          }}
        >
          {link.type === "link" ? "🔗" : "📝"}
        </Box>

        {/* 중앙 텍스트 */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#333",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {link.title}
          </Typography>
        </Box>

        {/* 우측 아이콘 */}
        <Box
          sx={{
            width: 28,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {link.type === "link" ? (
            <OpenInNewIcon sx={{ color: "#aaa", fontSize: 18 }} />
          ) : (
            <Box
              sx={{
                color: "#aaa",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              ⋯
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  )
}

import { Box, Paper, Stack, Typography } from "@mui/material"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: string
  backgroundColor?: string
  icon?: React.ReactNode
}

export default function StatCard({
  title,
  value,
  subtitle,
  color = "#0a0a0a",
  backgroundColor = "#fff",
  icon,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        m: 1,
        minWidth: 200,
        borderRadius: "8px",
        backgroundColor,
        border: "1.5px solid rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
          borderColor: "rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2.5}>
        {icon && (
          <Box
            sx={{
              color: "primary.main",
              fontSize: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Stack flex={1} spacing={1}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              fontSize: "14px",
              letterSpacing: "0.3px",
              color: "#666",
              textTransform: "none",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            fontWeight="800"
            color={color}
            sx={{
              fontSize: { xs: "32px", sm: "38px" },
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "13px",
                mt: 0.5,
                color: "#888",
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}

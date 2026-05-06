"use client"

import { Box, Typography } from "@mui/material"

interface ColumnBoxProps {
  title: string
  flex: number
  children: React.ReactNode
}

export default function ColumnBox({ title, flex, children }: ColumnBoxProps) {
  return (
    <Box
      flex={flex}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", maxHeight: 520 }}>{children}</Box>
    </Box>
  )
}

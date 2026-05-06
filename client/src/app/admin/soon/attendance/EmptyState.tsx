"use client"

import { Box, Typography } from "@mui/material"

interface EmptyStateProps {
  children: React.ReactNode
}

export default function EmptyState({ children }: EmptyStateProps) {
  return (
    <Box p={3} textAlign="center" color="text.secondary">
      <Typography variant="body2">{children}</Typography>
    </Box>
  )
}

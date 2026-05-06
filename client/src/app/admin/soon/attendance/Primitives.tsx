"use client"

import { Box, Stack, Typography } from "@mui/material"

export function ColumnBox({
  title,
  flex,
  children,
}: {
  title: string
  flex: number
  children: React.ReactNode
}) {
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

export function RowButton({
  focused,
  onClick,
  children,
}: {
  focused?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      onClick={onClick}
      sx={{
        px: 1,
        py: 0.5,
        borderBottom: "1px solid #eee",
        bgcolor: focused ? "#e3f2fd" : "transparent",
        cursor: "pointer",
        "&:hover": { bgcolor: focused ? "#bbdefb" : "#f0f7fc" },
      }}
    >
      {children}
    </Stack>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Box p={3} textAlign="center" color="text.secondary">
      <Typography variant="body2">{children}</Typography>
    </Box>
  )
}

"use client"

import { Stack } from "@mui/material"

interface RowButtonProps {
  focused?: boolean
  onClick: () => void
  children: React.ReactNode
}

export default function RowButton({
  focused,
  onClick,
  children,
}: RowButtonProps) {
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

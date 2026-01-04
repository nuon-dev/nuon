"use client"

import { Box, Stack } from "@mui/material"

interface RetreatButtonProps {
  label: string
  onClick: () => void
}

export default function RetreatButton({ label, onClick }: RetreatButtonProps) {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      onClick={onClick}
      sx={{ cursor: "pointer", mt: 4 }}
    >
      <img width="100%" src="/retreat/login/btn.png" />
      <Box
        fontWeight="600"
        fontSize="18px"
        color="white"
        position="absolute"
        sx={{ pointerEvents: "none" }}
      >
        {label}
      </Box>
    </Stack>
  )
}

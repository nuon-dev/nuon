"use client"

import { Box, Stack } from "@mui/material"

interface RetreatButtonProps {
  label: string
  onClick: () => void
  labelPosition?: "flex-start" | "center" | "flex-end"
}

export default function RetreatButton({
  label,
  onClick,
  labelPosition = "center",
}: RetreatButtonProps) {
  return (
    <Stack
      justifyContent="center"
      alignItems={labelPosition}
      onClick={onClick}
      height="100%"
      sx={{ cursor: "pointer" }}
    >
      <img width="100%" height="100%" src="/retreat/login/btn.png" />
      <Box
        fontWeight="400"
        fontSize="18px"
        color="white"
        position="absolute"
        px="10%"
        whiteSpace="pre"
        sx={{ pointerEvents: "none" }}
      >
        {label}
      </Box>
    </Stack>
  )
}

"use client"

import useAuth from "@/hooks/useAuth"
import { Box, Divider, Stack } from "@mui/material"

export default function UserInformation() {
  const { authUserData } = useAuth()

  if (!authUserData) {
    return null
  }

  return (
    <Stack>
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 3,
          textAlign: "center",
        }}
      >
        <Stack spacing={1} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
              mb: 1,
            }}
          >
            {authUserData.name.charAt(0)}
          </Box>
          <Stack>
            <Box sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {authUserData.name}
            </Box>
            <Box sx={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {authUserData.yearOfBirth}년생
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Divider />
    </Stack>
  )
}

"use client"

import { Stack } from "@mui/material"

export default function RetreatMainFirst() {
  return (
    <Stack
      width="100%"
      minHeight="calc(100dvh - 76px - env(safe-area-inset-top))"
      position="relative"
      zIndex={20}
      sx={{
        "& img:not(.noFadeIn)": {
          opacity: 0,
          animation: "fadeIn 2s ease forwards",
        },
        "@keyframes fadeIn": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      }}
    >
      <img
        src="/retreat/main/first/main_bg.png"
        className="noFadeIn"
        width="100%"
        height="100%"
        style={{
          objectFit: "cover",
          position: "absolute",
          inset: 0,
          zIndex: 10,
        }}
        alt="Main Background"
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop="24px"
        position="relative"
        paddingX="18px"
        zIndex={40}
      >
        <img
          src="/retreat/main/first/2026_SUMMER_RETREAT.png"
          alt="2026 SUMMER RETREAT"
          width="94px"
        />
        <img
          src="/retreat/main/first/SUWONJEILYOUNGPEOPLE.png"
          alt="SUWONJEILYOUNGPEOPLE"
          width="108px"
        />
      </Stack>
      <Stack
        alignItems="center"
        justifyContent="center"
        marginTop="70%"
        zIndex={40}
      >
        <img
          src="/retreat/main/first/Calling.png"
          alt="Calling"
          width="287px"
        />
      </Stack>
      <Stack
        alignItems="center"
        justifyContent="center"
        marginTop="20%"
        zIndex={40}
      >
        <img src="/retreat/main/first/date.png" alt="Date" width="241px" />
      </Stack>
      <Stack
        zIndex={40}
        alignItems="center"
        justifyContent="center"
        marginTop="8%"
        gap="20px"
      >
        <img src="/retreat/main/first/verse.png" width="304px" />
        <img src="/retreat/main/first/bible_reference.png" width="50px" />
      </Stack>
      <Stack
        zIndex={40}
        alignItems="center"
        justifyContent="center"
        marginTop="20%"
      >
        <img src="/retreat/main/first/main_bottom.png" width="90%" />
      </Stack>
    </Stack>
  )
}

"use client"

import { useState } from "react"
import { Box, Tab, Tabs } from "@mui/material"
import OverviewTab from "./OverviewTab"
import EditTab from "./EditTab"

export default function AttendanceAdminPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          px: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="조회" />
          <Tab label="입력" />
        </Tabs>
      </Box>
      {tab === 0 && <OverviewTab />}
      {tab === 1 && <EditTab />}
    </Box>
  )
}

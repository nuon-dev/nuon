"use client"

import axios from "@/config/axios"
import { Stack } from "@mui/material"
import { User } from "@server/entity/user"
import { useEffect, useState } from "react"
import RetreatAttendanceCard from "./RetreatAttendanceCard"

export default function RetreatAttendancePage() {
  const [soonList, setSoonList] = useState<User[]>([])
  useEffect(() => {
    fetchSoonList()
  }, [])

  async function fetchSoonList() {
    try {
      const response = await axios.get<User[]>(
        "/soon/retreat-attendance-records"
      )
      setSoonList(response.data)
    } catch (error) {
      console.error("Failed to fetch soon list:", error)
    }
  }

  return (
    <Stack>
      <Stack gap="8px" padding="16px">
        {soonList.map((soon) => (
          <Stack key={soon.id}>
            <RetreatAttendanceCard soon={soon} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

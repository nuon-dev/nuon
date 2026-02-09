"use client"

import { Box, MenuItem, Select, Stack } from "@mui/material"
import { CurrentStatus, HowToMove } from "@server/entity/types"
import { useRouter } from "next/navigation"
import { get } from "@/config/api"
import { useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { useNotification } from "@/hooks/useNotification"

export default function ShowStatusTable() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState(CurrentStatus.arriveChurch)
  const [allUserList, setAllUserList] = useState<Array<RetreatAttend>>([])
  const { error } = useNotification()

  useEffect(() => {
    fetchUserData()
    setInterval(fetchUserData, 1000 * 30)
  }, [])

  async function fetchUserData() {
    try {
      const list: RetreatAttend[] = await get("/retreat/admin/get-all-user")
      if (list) {
        setAllUserList(
          list.sort((a, b) => a.user.yearOfBirth - b.user.yearOfBirth),
        )
      }
    } catch {
      router.push("/retreat/admin")
      error("권한이 없습니다.")
      return
    }
  }

  function ArriveCurchUserList() {
    const busUser = allUserList.filter(
      (user) => user.howToGo === HowToMove.together,
    )
    const arriveUser = busUser.filter(
      (user) => user.currentStatus === CurrentStatus.arriveChurch,
    )
    const notArriveUser = busUser.filter(
      (user) => user.currentStatus === CurrentStatus.null,
    )
    return (
      <Stack gap="24px">
        도착해야 하는 인원 ({notArriveUser.length}명)
        <Stack direction="row" flexWrap="wrap" gap="12px">
          {notArriveUser.map((retreatAttend) => (
            <Stack
              gap="24px"
              width="300px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{retreatAttend.user.name}</Box>
              <Box>{retreatAttend.user.yearOfBirth}</Box>
              <Box>{retreatAttend.user.phone}</Box>
            </Stack>
          ))}
        </Stack>
        도착한 인원 ({arriveUser.length}명)
        <Stack direction="row" flexWrap="wrap" gap="12px">
          {arriveUser.map((retreatAttend) => (
            <NotArriveComponent retreatAttend={retreatAttend} />
          ))}
        </Stack>
      </Stack>
    )
  }

  function ArriveAuditoriumUserList() {
    const arriveUser = allUserList.filter(
      (user) => user.currentStatus === CurrentStatus.arriveAuditorium,
    )

    const notArriveUser = allUserList.filter(
      (user) => user.currentStatus !== CurrentStatus.arriveAuditorium,
    )

    return (
      <Stack gap="24px">
        도착해야 하는 인원 ({notArriveUser.length}명)
        <Stack direction="row" flexWrap="wrap" gap="12px">
          {notArriveUser.map((retreatAttend) => (
            <Stack
              gap="24px"
              width="400px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{retreatAttend.user.name}</Box>
              <Box>{retreatAttend.user.yearOfBirth}</Box>
              <Box>{retreatAttend.user.phone}</Box>
            </Stack>
          ))}
        </Stack>
        도착한 인원 ({arriveUser.length}명)
        <Stack direction="row" flexWrap="wrap" gap="12px">
          {arriveUser.map((retreatAttend) => (
            <NotArriveComponent retreatAttend={retreatAttend} />
          ))}
        </Stack>
      </Stack>
    )
  }

  function NotArriveComponent({
    retreatAttend,
  }: {
    retreatAttend: RetreatAttend
  }) {
    return (
      <Stack
        gap="24px"
        width="150px"
        padding="12px"
        direction="row"
        borderRadius="12px"
        bgcolor={retreatAttend.user.gender === "man" ? "lightblue" : "pink"}
      >
        <Box>{retreatAttend.user.name}</Box>
        <Box>{retreatAttend.user.gender}</Box>
      </Stack>
    )
  }

  function UserListDisplayer() {
    switch (statusFilter) {
      case CurrentStatus.null:
        return <></>
      case CurrentStatus.arriveChurch:
        return <ArriveCurchUserList />
      case CurrentStatus.arriveAuditorium:
        return <ArriveAuditoriumUserList />
    }
    return <></>
  }

  return (
    <Stack p="24px" gap="12px">
      <Select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(Number.parseInt(e.target.value.toString()))
        }
      >
        <MenuItem value={CurrentStatus.arriveChurch}>교회 도착</MenuItem>
        <MenuItem value={CurrentStatus.arriveAuditorium}>
          수련회장 도착
        </MenuItem>
      </Select>
      <UserListDisplayer />
    </Stack>
  )
}

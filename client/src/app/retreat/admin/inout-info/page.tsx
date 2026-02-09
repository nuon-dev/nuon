"use client"

import { useEffect, useState } from "react"
import { Box, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import { get } from "@/config/api"
import { useSetAtom } from "jotai"
import { Days, HowToMove, InOutType } from "@server/entity/types"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { useNotification } from "@/hooks/useNotification"

function InoutInfo() {
  const router = useRouter()
  const [allUserList, setAllUserList] = useState<Array<RetreatAttend>>([])
  const [allInoutInfo, setAllInoutInfo] = useState([] as InOutInfo[])
  const { error } = useNotification()

  useEffect(() => {
    ;(async () => {
      try {
        const list = await get("/retreat/admin/get-all-user")
        if (list) {
          setAllUserList(list)
        }
      } catch {
        router.push("/retreat/admin")
        error("권한이 없습니다.")
        return
      }
      get("/retreat/admin/get-car-info")
        .then((data: InOutInfo[]) => {
          setAllInoutInfo(data)
        })
        .catch(() => {
          router.push("/retreat/admin")
          error("권한이 없습니다.")
          return
        })
    })()
  }, [])

  return (
    <Stack gap="12px" padding="12px">
      <Box>목요일에 교회에서 버스타고 수련회장 가는 인원</Box>
      <Stack direction="row" flexWrap="wrap" gap="12px">
        {allUserList
          .filter((u) => u.howToGo === HowToMove.together)
          .sort((a, b) => a.user.yearOfBirth - b.user.yearOfBirth)
          .map((retreatAttend) => (
            <Stack
              gap="24px"
              width="150px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{retreatAttend.user.name}</Box>
              <Box>{retreatAttend.user.gender}</Box>
            </Stack>
          ))}
      </Stack>
      <Box>목요일에 버스가 아닌 이동이 있는 인원</Box>
      <Stack direction="row" flexWrap="wrap" gap="12px">
        {allInoutInfo
          .filter((info) => info.day === Days.firstDay)
          .sort(
            (a, b) =>
              a.retreatAttend.user.yearOfBirth -
              b.retreatAttend.user.yearOfBirth,
          )
          .map((info) => (
            <Stack
              gap="24px"
              width="300px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                info.retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{info.retreatAttend.user.name}</Box>
              <Box>{info.retreatAttend.user.gender}</Box>
              <Box>{info.time}시에</Box>
              <Box>{info.inOutType === InOutType.IN ? "들어감" : "나감"}</Box>
            </Stack>
          ))}
      </Stack>
      <Box>금요일에 버스가 아닌 이동이 있는 인원</Box>
      <Stack direction="row" flexWrap="wrap" gap="12px">
        {allInoutInfo
          .filter((info) => info.day === 1)
          .sort(
            (a, b) =>
              a.retreatAttend.user.yearOfBirth -
              b.retreatAttend.user.yearOfBirth,
          )
          .map((info) => (
            <Stack
              gap="24px"
              width="300px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                info.retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{info.retreatAttend.user.name}</Box>
              <Box>{info.retreatAttend.user.yearOfBirth}</Box>
              <Box>{info.time}시에</Box>
              <Box>{info.inOutType === InOutType.IN ? "들어감" : "나감"}</Box>
            </Stack>
          ))}
      </Stack>
      <Box>토요일에 버스가 아닌 이동이 있는 인원</Box>
      <Stack direction="row" flexWrap="wrap" gap="12px">
        {allInoutInfo
          .filter((info) => info.day === 2)
          .sort(
            (a, b) =>
              a.retreatAttend.user.yearOfBirth -
              b.retreatAttend.user.yearOfBirth,
          )
          .map((info) => (
            <Stack
              gap="24px"
              width="300px"
              padding="12px"
              direction="row"
              borderRadius="12px"
              bgcolor={
                info.retreatAttend.user.gender === "man" ? "lightblue" : "pink"
              }
            >
              <Box>{info.retreatAttend.user.name}</Box>
              <Box>{info.retreatAttend.user.yearOfBirth}</Box>
              <Box>{info.time}시에</Box>
              <Box>{info.inOutType === InOutType.IN ? "들어감" : "나감"}</Box>
            </Stack>
          ))}
      </Stack>
    </Stack>
  )
}

export default InoutInfo

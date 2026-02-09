"use client"

import { useEffect, useState } from "react"
import {
  Box,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { get } from "@/config/api"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { Days, HowToMove } from "@server/entity/types"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"

let allInoutInfoList: InOutInfo[] = []

export default function CarpoolingList() {
  const router = useRouter()
  const [moveTypeFilter, setMoveTypeFilter] = useState<HowToMove>(
    HowToMove.none,
  )
  const [matchFilter, setMatchFilter] = useState<
    "true" | "false" | "undefined"
  >("undefined")
  const [inOutInfoList, setAllUserList] = useState<Array<InOutInfo>>([])
  const { error } = useNotification()

  useEffect(() => {
    ;(async () => {
      try {
        const list: InOutInfo[] = await get("/retreat/admin/get-car-info")
        if (list) {
          allInoutInfoList = list
          setAllUserList(list)
        }
      } catch {
        router.push("/retreat/admin")
        error("권한이 없습니다.")
        return
      }
    })()
  }, [])

  useEffect(() => {
    let result = [...allInoutInfoList]
    if (matchFilter === "true") {
      result = result.filter(
        (inOutInfo) =>
          inOutInfo.userInTheCar.length > 0 || !!inOutInfo.rideCarInfo,
      )
    } else if (matchFilter === "false") {
      result = result.filter(
        (inOutInfo) =>
          inOutInfo.userInTheCar.length === 0 && !inOutInfo.rideCarInfo,
      )
    }

    if (moveTypeFilter !== HowToMove.none) {
      result = result.filter(
        (inOutInfo) => inOutInfo.howToMove === moveTypeFilter,
      )
    }

    setAllUserList(result)
  }, [matchFilter, moveTypeFilter])

  function getHowToMoveString(howToMove: HowToMove) {
    switch (howToMove) {
      case HowToMove.driveCarAlone:
        return "카풀 불가"
      case HowToMove.rideCar:
        return "카풀 요청"
      case HowToMove.driveCarWithPerson:
        return "카풀 제공"
      case HowToMove.goAlone:
        return "대중교통"
      case HowToMove.etc:
        return "기타"
    }
  }

  function getDayString(day: Days) {
    switch (day) {
      case Days.firstDay:
        return "첫째날"
      case Days.secondDay:
        return "둘째날"
      case Days.thirdDay:
        return "셋째날"
    }
    return ""
  }

  return (
    <Stack>
      <Header />
      <Stack
        mt="8px"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          fontSize="20px"
          fontWeight="bold"
          textAlign="center"
          width="100%"
        >
          카풀 명단
        </Stack>
      </Stack>
      <Stack
        direction="row"
        gap="12px"
        px="12px"
        textAlign="center"
        alignItems="center"
      >
        <Box>이동 방법 : </Box>
        <Select
          value={moveTypeFilter}
          onChange={(e) => setMoveTypeFilter(e.target.value as any)}
        >
          <MenuItem value={HowToMove.none}>전체</MenuItem>
          <MenuItem value={HowToMove.driveCarAlone}>카풀 불가</MenuItem>
          <MenuItem value={HowToMove.rideCar}>카풀 요청</MenuItem>
          <MenuItem value={HowToMove.driveCarWithPerson}>카풀 제공</MenuItem>
          <MenuItem value={HowToMove.goAlone}>대중교통</MenuItem>
          <MenuItem value={HowToMove.etc}>기타</MenuItem>
        </Select>
        <Box>매칭 여부 : </Box>
        <Select
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value as any)}
        >
          <MenuItem value={"undefined"}>전체</MenuItem>
          <MenuItem value={"true"}>매칭</MenuItem>
          <MenuItem value={"false"}>미매칭</MenuItem>
        </Select>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>출생년도</TableCell>
            <TableCell>전화번호</TableCell>
            <TableCell>요일</TableCell>
            <TableCell>시간</TableCell>
            <TableCell>이동 방법</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inOutInfoList.map((inOutInfo) => (
            <TableRow key={inOutInfo.id}>
              <TableCell>{inOutInfo.retreatAttend.user.name}</TableCell>
              <TableCell>{inOutInfo.retreatAttend.user.yearOfBirth}</TableCell>
              <TableCell>{inOutInfo.retreatAttend.user.phone}</TableCell>
              <TableCell>{getDayString(inOutInfo.day)}</TableCell>
              <TableCell>{inOutInfo.time}</TableCell>
              <TableCell>{getHowToMoveString(inOutInfo.howToMove)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}

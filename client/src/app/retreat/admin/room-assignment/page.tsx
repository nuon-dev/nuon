"use client"

import { Box, Button, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { get, post } from "../../../../config/api"
import { useRouter } from "next/navigation"
import { useSetAtom } from "jotai"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"

function RoomAssingment() {
  const { push } = useRouter()
  const [unassignedUserList, setUnassignedUserList] = useState(
    [] as Array<RetreatAttend>,
  )
  const [roomList, setRoomList] = useState([] as Array<Array<RetreatAttend>>)
  const [selectedUser, setSelectedUser] = useState<RetreatAttend>()
  const [maxRoomNumber, setMaxRoomNumber] = useState(0)
  const [isShowUserInfo, setIsShowUserInfo] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState({} as RetreatAttend)
  const [userAttendInfo, setUserAttendInfo] = useState([] as Array<InOutInfo>)

  const [mousePoint, setMousePoint] = useState([0, 0])
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })

  const [gender, setGender] = useState("man")
  const { error } = useNotification()

  function onMouseMove(event: MouseEvent) {
    setMousePoint([event.pageX, event.pageY])
  }

  useEffect(() => {
    fetchData()
    addEventListener("mousemove", onMouseMove)

    return () => {
      removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  function fetchData() {
    get("/retreat/admin/get-room-assignment")
      .then((response: Array<RetreatAttend>) => {
        const unassignedUserList = response
          .filter(
            (retreatAttend) =>
              !retreatAttend.roomNumber || retreatAttend.roomNumber === 0,
          )
          .sort((a, b) => a.user.yearOfBirth - b.user.yearOfBirth)
        setUnassignedUserList(unassignedUserList)

        const room = [] as Array<Array<RetreatAttend>>
        const assignedUserList = response.filter(
          (retreatAttend) => retreatAttend.roomNumber,
        )
        assignedUserList.map((retreatAttend) => {
          const roomNumber = retreatAttend.roomNumber - 1
          if (!room[roomNumber]) {
            room[roomNumber] = [retreatAttend]
          } else {
            room[roomNumber].push(retreatAttend)
            room[roomNumber].sort(
              (a, b) => a.user.yearOfBirth - b.user.yearOfBirth,
            )
          }
          setRoomList(room)
        })
        const maxNumber = Math.max(
          ...response.map((retreatAttend) => retreatAttend.roomNumber),
        )
        setMaxRoomNumber(maxNumber)
      })
      .catch(() => {
        push("/retreat/admin")
        error("권한이 없습니다.")
        return
      })
  }

  function unassignedUserRow(retreatAttend: RetreatAttend) {
    return (
      <Stack
        direction="row"
        onMouseDown={(e) => {
          setSelectedUser(retreatAttend)
          const target = e.target as HTMLElement
          const shiftX = e.clientX - target.getBoundingClientRect().left
          const shiftY = e.clientY - target.getBoundingClientRect().top
          setShiftPosition({ x: shiftX, y: shiftY })
        }}
        onMouseUp={() => {
          setRoom(0)
          setSelectedUser(undefined)
        }}
        onMouseEnter={() => {
          setModal(retreatAttend)
        }}
        onMouseLeave={() => {
          setIsShowUserInfo(false)
        }}
        sx={{
          justifyContent: "space-between",
          backgroundColor:
            retreatAttend.user.gender === "man" ? "lightblue" : "pink",
        }}
        px="4px"
      >
        <Box>
          {retreatAttend.user.name}({retreatAttend.user.yearOfBirth})
          {retreatAttend.etc ||
          (retreatAttend.inOutInfos && retreatAttend.inOutInfos.length) > 0
            ? "*"
            : ""}
        </Box>
      </Stack>
    )
  }

  function modal() {
    if (!isShowUserInfo) {
      return <Stack />
    }
    if (!showUserInfo.etc && userAttendInfo.length === 0) {
      return <Stack />
    }
    return (
      <Stack
        style={{
          padding: "6px",
          position: "absolute",
          borderRadius: "4px",
          top: mousePoint[1] + 10,
          left: mousePoint[0] + 10,
          backgroundColor: "#FEFEFE",
          border: "1px solid #ACACAC",
        }}
      >
        {showUserInfo.etc}
        {showUserInfo.etc && userAttendInfo.length > 0 && (
          <Box width="100%" height="1px" bgcolor="#ACACAC" my="4px" />
        )}
        {userAttendInfo.map((info) => (
          <Stack>
            {[, "첫", "둘", "셋"][info.day]}째 날 / {info.time} /{" "}
            {info.inOutType === "in" ? "들어옴" : "나감"}
          </Stack>
        ))}
      </Stack>
    )
  }

  function setModal(retreatAttend: RetreatAttend) {
    setIsShowUserInfo(true)
    setShowUserInfo(retreatAttend)
    setUserAttendInfo(retreatAttend.inOutInfos)
  }

  function userRoomRow(retreatAttend: RetreatAttend) {
    return (
      <Stack
        direction="row"
        p="2px"
        onMouseDown={(e) => {
          setSelectedUser(retreatAttend)
          const target = e.target as HTMLElement
          const shiftX = e.clientX - target.getBoundingClientRect().left
          const shiftY = e.clientY - target.getBoundingClientRect().top
          setShiftPosition({ x: shiftX, y: shiftY })
        }}
        onMouseEnter={() => {
          setModal(retreatAttend)
        }}
        onMouseLeave={() => {
          setIsShowUserInfo(false)
        }}
        width="160px"
        sx={{
          justifyContent: "space-between",
          backgroundColor:
            retreatAttend.user.gender === "man" ? "lightblue" : "pink",
        }}
      >
        <Box>
          {retreatAttend.user.name}({retreatAttend.user.yearOfBirth})
          {retreatAttend.etc ||
          (retreatAttend.inOutInfos && retreatAttend.inOutInfos.length) > 0
            ? "*"
            : ""}
        </Box>
      </Stack>
    )
  }

  function Room(roomNumber: number, userList: Array<RetreatAttend>) {
    return (
      <Stack
        sx={{
          margin: "8px",
          minHeight: "20px",
          borderRadius: "8px",
          boxShadow: "2px 2px 5px 3px #ACACAC;",
          border: "1px solid #ACACAC",
        }}
        onMouseUp={() => {
          setRoom(roomNumber)
          setSelectedUser(undefined)
        }}
      >
        <Stack width="160px" textAlign="center" py="4px">
          {roomNumber}번 방 (
          {
            userList.filter(
              (retreatAttend) => retreatAttend.user.gender === gender,
            ).length
          }
          )
        </Stack>
        {userList
          .filter((retreatAttend) => retreatAttend.user.gender === gender)
          .map((retreatAttend) => userRoomRow(retreatAttend))}
      </Stack>
    )
  }

  async function setRoom(roomNumber: number) {
    if (!selectedUser) {
      return
    }
    selectedUser.roomNumber = roomNumber
    await post("/retreat/admin/set-room", {
      selectedUser: selectedUser,
    })
    fetchData()
  }

  return (
    <Stack>
      <Header />
      <Stack ml="12px">
        <Stack
          direction="row"
          mb="12px"
          justifyContent="space-between"
          alignContent="center"
        >
          <Stack />
          <Stack direction="row">
            <Stack fontWeight="600" fontSize="24px" justifyContent="center">
              {gender === "man" ? "남자" : "여자"} 방배정
            </Stack>
            <Button
              variant="outlined"
              onClick={() => setGender(gender === "man" ? "woman" : "man")}
              style={{
                margin: "16px",
              }}
            >
              성별 변경 하기
            </Button>
          </Stack>
          <Stack
            style={{
              backgroundColor: "#FAFAFA",
            }}
            margin="8px"
            padding="8px"
            borderRadius="8px"
            justifyContent="center"
            border="1px solid #ACACAC"
          >
            사람의 이름을 눌러 드래그 드롭으로 또는 사람 후 방을 클릭하여 넣으면
            됩니다.
            <br />
            마우스 오버시 사용자의 정보가 나옵니다.
            <br />
          </Stack>
        </Stack>
        {modal()}
        <Stack mb="40px" direction="row">
          <Stack
            style={{
              margin: "6px",
              minHeight: "20px",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px 3px #ACACAC;",
              border: "1px solid #ACACAC",
              paddingBottom: "20px",
            }}
            onMouseUp={() => {
              setRoom(0)
              setSelectedUser(undefined)
            }}
            width="160px"
          >
            <Box textAlign="center" py="4px">
              미배정(
              {
                unassignedUserList.filter(
                  (roomNumber) => roomNumber.user.gender === gender,
                ).length
              }
              명)
            </Box>
            {unassignedUserList
              .filter((roomNumber) => roomNumber.user.gender === gender)
              .map((roomNumber) => unassignedUserRow(roomNumber))}
          </Stack>
          <Stack
            style={{
              padding: "4px",
              flexWrap: "wrap",
              margin: "4px",
              width: "calc(100% - 200px)",
              overflowWrap: "inherit",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {new Array(maxRoomNumber).fill(0).map((_, index) => {
              const room = roomList[index]
              if (!room || room.length === 0) {
                return Room(index + 1, [])
              } else {
                return Room(room[0].roomNumber, room)
              }
            })}
            {Room(maxRoomNumber + 1, [])}
          </Stack>
        </Stack>
        {selectedUser && selectedUser.id && (
          <Stack
            position="absolute"
            top={mousePoint[1] - shiftPosition.y}
            left={mousePoint[0] - shiftPosition.x}
            style={{ pointerEvents: "none" }}
          >
            {userRoomRow(selectedUser)}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

export default RoomAssingment

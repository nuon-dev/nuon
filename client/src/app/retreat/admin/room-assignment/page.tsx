"use client"

import { Box, Button, IconButton, Stack, TextField } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { get, post } from "../../../../config/api"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"

type DraftRoom = {
  id: string
  roomNumber: number
  members: Array<RetreatAttend>
  isDraft?: boolean
}

type DraftState = {
  rooms: Array<DraftRoom>
  unassignedUsers: Array<RetreatAttend>
}

function RoomAssignment() {
  const { push } = useRouter()
  const { error, success } = useNotification()
  const [draftState, setDraftState] = useState<DraftState>({
    rooms: [],
    unassignedUsers: [],
  })
  const [selectedUser, setSelectedUser] = useState<RetreatAttend>()
  const [mousePoint, setMousePoint] = useState([0, 0])
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })
  const [isShowUserInfo, setIsShowUserInfo] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState({} as RetreatAttend)
  const [userAttendInfo, setUserAttendInfo] = useState([] as Array<InOutInfo>)
  const [gender, setGender] = useState("man")
  const [isSaving, setIsSaving] = useState(false)
  const [roomNumberDrafts, setRoomNumberDrafts] = useState<
    Record<string, string>
  >({})

  function sortByBirthYear(userList: Array<RetreatAttend>) {
    return [...userList].sort((a, b) => a.user.yearOfBirth - b.user.yearOfBirth)
  }

  function sortRooms(rooms: Array<DraftRoom>) {
    return [...rooms].sort((left, right) => left.roomNumber - right.roomNumber)
  }

  function getVisibleMembers(room: DraftRoom) {
    return room.members.filter(
      (retreatAttend) => retreatAttend.user.gender === gender,
    )
  }

  function normalizeResponse(response: Array<RetreatAttend>) {
    const unassignedUsers = sortByBirthYear(
      response.filter(
        (retreatAttend) =>
          !retreatAttend.roomNumber || retreatAttend.roomNumber === 0,
      ),
    )

    const roomMap = new Map<number, Array<RetreatAttend>>()
    response
      .filter(
        (retreatAttend) =>
          retreatAttend.roomNumber && retreatAttend.roomNumber !== 0,
      )
      .forEach((retreatAttend) => {
        const currentRoom = roomMap.get(retreatAttend.roomNumber) || []
        roomMap.set(retreatAttend.roomNumber, [...currentRoom, retreatAttend])
      })

    const rooms = [...roomMap.entries()].map(([roomNumber, members]) => ({
      id: `room-${roomNumber}`,
      roomNumber,
      members: sortByBirthYear(members),
      isDraft: false,
    }))

    return {
      rooms: sortRooms(rooms),
      unassignedUsers,
    }
  }

  function syncRoomNumberDrafts(rooms: Array<DraftRoom>) {
    setRoomNumberDrafts(
      rooms.reduce<Record<string, string>>((accumulator, room) => {
        accumulator[room.id] = String(room.roomNumber)
        return accumulator
      }, {}),
    )
  }

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
        const nextState = normalizeResponse(response)
        setDraftState(nextState)
        syncRoomNumberDrafts(nextState.rooms)
        setSelectedUser(undefined)
      })
      .catch(() => {
        push("/retreat/admin")
        error("권한이 없습니다.")
      })
  }

  async function persistDraftState(nextState: DraftState) {
    const usersById = new Map<string, RetreatAttend>()

    nextState.unassignedUsers.forEach((user) => {
      usersById.set(user.id, user)
    })
    nextState.rooms.forEach((room) => {
      room.members.forEach((user) => {
        usersById.set(user.id, user)
      })
    })

    setIsSaving(true)

    try {
      await Promise.all(
        [...usersById.values()].map((selectedUser) =>
          post("/retreat/admin/set-room", {
            selectedUser,
          }),
        ),
      )
    } catch {
      error("방 저장에 실패했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  function moveUserToRoom(
    state: DraftState,
    userId: string,
    nextRoomNumber: number,
  ) {
    const currentRoomNumber = state.unassignedUsers.some(
      (user) => user.id === userId,
    )
      ? 0
      : state.rooms.find((room) =>
          room.members.some((user) => user.id === userId),
        )?.roomNumber || 0

    if (currentRoomNumber === nextRoomNumber) {
      return state
    }

    const nextState: DraftState = {
      rooms: state.rooms.map((room) => ({
        ...room,
        members: [...room.members],
      })),
      unassignedUsers: [...state.unassignedUsers],
    }

    let movingUser: RetreatAttend | undefined

    nextState.unassignedUsers = nextState.unassignedUsers.filter((user) => {
      if (user.id === userId) {
        movingUser = user
        return false
      }

      return true
    })

    if (!movingUser) {
      for (const room of nextState.rooms) {
        const userIndex = room.members.findIndex((user) => user.id === userId)
        if (userIndex !== -1) {
          movingUser = room.members.splice(userIndex, 1)[0]
          break
        }
      }
    }

    if (!movingUser) {
      return state
    }

    const movedUser = { ...movingUser, roomNumber: nextRoomNumber }

    if (nextRoomNumber === 0) {
      nextState.unassignedUsers = sortByBirthYear([
        ...nextState.unassignedUsers,
        movedUser,
      ])
    } else {
      const targetRoom = nextState.rooms.find(
        (room) => room.roomNumber === nextRoomNumber,
      )

      if (targetRoom) {
        targetRoom.members = sortByBirthYear([...targetRoom.members, movedUser])
      } else {
        nextState.rooms.push({
          id: `room-${nextRoomNumber}-${movingUser.id}`,
          roomNumber: nextRoomNumber,
          members: [movedUser],
        })
      }
    }

    nextState.rooms = sortRooms(
      nextState.rooms.map((room) => ({
        ...room,
        members: sortByBirthYear(room.members),
      })),
    )
    nextState.unassignedUsers = sortByBirthYear(nextState.unassignedUsers)

    return nextState
  }

  function applyDrop(nextRoomNumber: number) {
    if (!selectedUser) {
      return
    }

    const nextState = moveUserToRoom(
      draftState,
      selectedUser.id,
      nextRoomNumber,
    )
    if (nextState === draftState) {
      setSelectedUser(undefined)
      return
    }

    setDraftState(nextState)
    syncRoomNumberDrafts(nextState.rooms)
    void persistDraftState(nextState)
    setSelectedUser(undefined)
  }

  function addRoom() {
    setDraftState((prevState) => {
      const usedNumbers = new Set(
        prevState.rooms.map((room) => room.roomNumber),
      )
      let nextRoomNumber = 1

      while (usedNumbers.has(nextRoomNumber)) {
        nextRoomNumber += 1
      }

      const nextState = {
        ...prevState,
        rooms: sortRooms([
          ...prevState.rooms,
          {
            id: `room-${nextRoomNumber}-${Date.now()}`,
            roomNumber: nextRoomNumber,
            members: [],
            isDraft: true,
          },
        ]),
      }

      syncRoomNumberDrafts(nextState.rooms)
      return nextState
    })
  }

  function removeRoom(roomId: string) {
    const targetRoom = draftState.rooms.find((room) => room.id === roomId)
    if (!targetRoom) {
      return
    }

    const nextState: DraftState = {
      rooms: draftState.rooms.filter((room) => room.id !== roomId),
      unassignedUsers: sortByBirthYear([
        ...draftState.unassignedUsers,
        ...targetRoom.members.map((user) => ({
          ...user,
          roomNumber: 0,
        })),
      ]),
    }

    setDraftState(nextState)
    syncRoomNumberDrafts(nextState.rooms)
    void persistDraftState(nextState)
  }

  function renameRoom(roomId: string, nextRoomNumber: number) {
    if (!Number.isFinite(nextRoomNumber) || nextRoomNumber <= 0) {
      const currentRoom = draftState.rooms.find((room) => room.id === roomId)
      setRoomNumberDrafts((prevDrafts) => ({
        ...prevDrafts,
        [roomId]: String(currentRoom?.roomNumber || ""),
      }))
      return
    }

    const sourceRoom = draftState.rooms.find((room) => room.id === roomId)
    if (!sourceRoom || sourceRoom.roomNumber === nextRoomNumber) {
      setRoomNumberDrafts((prevDrafts) => ({
        ...prevDrafts,
        [roomId]: String(sourceRoom?.roomNumber || nextRoomNumber),
      }))
      return
    }

    const updatedUsers = [
      ...draftState.unassignedUsers,
      ...draftState.rooms.flatMap((room) =>
        room.members.map((user) =>
          room.id === roomId && user.user.gender === gender
            ? { ...user, roomNumber: nextRoomNumber }
            : user,
        ),
      ),
    ]

    const nextState = normalizeResponse(updatedUsers)

    if (sourceRoom.isDraft && sourceRoom.members.length === 0) {
      nextState.rooms.push({
        ...sourceRoom,
        roomNumber: nextRoomNumber,
        isDraft: true,
      })
    }

    draftState.rooms.forEach((room) => {
      if (
        room.id !== roomId &&
        room.isDraft &&
        room.members.length === 0 &&
        nextState.rooms.every((nextRoom) => nextRoom.id !== room.id)
      ) {
        nextState.rooms.push(room)
      }
    })

    nextState.rooms = sortRooms(nextState.rooms)

    setDraftState(nextState)
    syncRoomNumberDrafts(nextState.rooms)
    void persistDraftState(nextState)
  }

  function setModal(retreatAttend: RetreatAttend) {
    setIsShowUserInfo(true)
    setShowUserInfo(retreatAttend)
    setUserAttendInfo(retreatAttend.inOutInfos)
  }

  function renderUserRow(retreatAttend: RetreatAttend) {
    return (
      <Stack
        direction="row"
        key={retreatAttend.id}
        onMouseDown={(event) => {
          setSelectedUser(retreatAttend)
          const target = event.currentTarget as HTMLElement
          const shiftX = event.clientX - target.getBoundingClientRect().left
          const shiftY = event.clientY - target.getBoundingClientRect().top
          setShiftPosition({ x: shiftX, y: shiftY })
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
          borderRadius: "6px",
          cursor: "grab",
          userSelect: "none",
        }}
        px="4px"
        py="2px"
      >
        <Box>
          {retreatAttend.user.name}({retreatAttend.user.yearOfBirth})
          {retreatAttend.user.etc ||
          (retreatAttend.inOutInfos && retreatAttend.inOutInfos.length) > 0
            ? "*"
            : ""}
          {retreatAttend.isHalf ? " (부참)" : ""}
        </Box>
      </Stack>
    )
  }

  function renderRoom(room: DraftRoom) {
    const visibleMembers = getVisibleMembers(room)
    const shouldShowRoom = visibleMembers.length > 0 || room.isDraft

    if (!shouldShowRoom) {
      return null
    }

    return (
      <Stack
        key={room.id}
        sx={{
          margin: "8px",
          minHeight: "20px",
          borderRadius: "8px",
          boxShadow: "2px 2px 5px 3px #ACACAC;",
          border: "1px solid #ACACAC",
          backgroundColor: "#fff",
        }}
        onMouseUp={() => {
          applyDrop(room.roomNumber)
        }}
      >
        <Stack
          width="170px"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          px="8px"
          py="6px"
          gap="6px"
        >
          <TextField
            size="small"
            type="number"
            value={roomNumberDrafts[room.id] ?? String(room.roomNumber)}
            onChange={(event) => {
              setRoomNumberDrafts((prevDrafts) => ({
                ...prevDrafts,
                [room.id]: event.target.value,
              }))
            }}
            onBlur={(event) => {
              const nextRoomNumber = Number(event.target.value)
              renameRoom(room.id, nextRoomNumber)
            }}
            inputProps={{ min: 1, step: 1 }}
            sx={{ width: "72px" }}
          />
          <Box whiteSpace="nowrap">{visibleMembers.length}명</Box>
          <IconButton
            size="small"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              removeRoom(room.id)
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack gap="4px" px="6px" pb="6px" minWidth="160px">
          {visibleMembers.length === 0 ? (
            <Box
              px="8px"
              py="10px"
              textAlign="center"
              color="#8A8A8A"
              fontSize="14px"
            >
              비어 있음
            </Box>
          ) : (
            visibleMembers.map((retreatAttend) => renderUserRow(retreatAttend))
          )}
        </Stack>
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
          <Stack key={info.id}>
            {[, "첫", "둘", "셋"][info.day]}째 날 / {info.time} /{" "}
            {info.inOutType === "in" ? "들어옴" : "나감"}
          </Stack>
        ))}
      </Stack>
    )
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
          <Stack direction="row" alignItems="center">
            <Stack fontWeight="600" fontSize="24px" justifyContent="center">
              {gender === "man" ? "남자" : "여자"} 방배정
            </Stack>
            <Button
              variant="outlined"
              onClick={() => setGender(gender === "man" ? "woman" : "man")}
              style={{ margin: "16px" }}
            >
              성별 변경 하기
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={() => fetchData()}
              disabled={isSaving}
            >
              다시 불러오기
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRoom}
              disabled={isSaving}
              style={{ marginLeft: "8px" }}
            >
              방 추가
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
            사람의 이름을 눌러 드래그 드롭으로 또는 방 번호를 수정하면 바로
            저장됩니다.
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
              padding: "4px",
            }}
            onMouseUp={() => {
              applyDrop(0)
            }}
            gap="4px"
            width="170px"
          >
            <Box textAlign="center" py="4px">
              미배정(
              {
                draftState.unassignedUsers.filter(
                  (roomNumber) => roomNumber.user.gender === gender,
                ).length
              }
              명)
            </Box>
            {draftState.unassignedUsers
              .filter((roomNumber) => roomNumber.user.gender === gender)
              .map((roomNumber) => renderUserRow(roomNumber))}
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
            {draftState.rooms.map((room) => renderRoom(room))}
          </Stack>
        </Stack>
        {selectedUser && selectedUser.id && (
          <Stack
            position="absolute"
            top={mousePoint[1] - shiftPosition.y}
            left={mousePoint[0] - shiftPosition.x}
            style={{ pointerEvents: "none" }}
          >
            {renderUserRow(selectedUser)}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

export default RoomAssignment

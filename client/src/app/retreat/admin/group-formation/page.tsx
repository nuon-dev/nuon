"use client"

import { Box, Button, IconButton, Stack, TextField } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { get, post } from "@/config/api"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"

type DraftGroup = {
  id: string
  groupNumber: number
  members: Array<RetreatAttend>
}

type DraftState = {
  groups: Array<DraftGroup>
  unassignedUsers: Array<RetreatAttend>
}

function GroupFormation() {
  const { push } = useRouter()
  const { error, success } = useNotification()
  const [draftState, setDraftState] = useState<DraftState>({
    groups: [],
    unassignedUsers: [],
  })
  const [selectedUser, setSelectedUser] = useState<RetreatAttend>()
  const [mousePoint, setMousePoint] = useState([0, 0])
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })
  const [isShowUserInfo, setIsShowUserInfo] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState({} as RetreatAttend)
  const [userAttendInfo, setUserAttendInfo] = useState([] as Array<InOutInfo>)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [groupNumberDrafts, setGroupNumberDrafts] = useState<
    Record<string, string>
  >({})

  function sortByBirthYear(userList: Array<RetreatAttend>) {
    return [...userList].sort((a, b) => a.user.yearOfBirth - b.user.yearOfBirth)
  }

  function sortGroups(groups: Array<DraftGroup>) {
    return [...groups].sort(
      (left, right) => left.groupNumber - right.groupNumber,
    )
  }

  function normalizeResponse(response: Array<RetreatAttend>) {
    const unassignedUsers = sortByBirthYear(
      response.filter((user) => user.groupNumber === 0),
    )

    const groupMap = new Map<number, Array<RetreatAttend>>()
    response
      .filter((user) => user.groupNumber !== 0)
      .forEach((user) => {
        const currentGroup = groupMap.get(user.groupNumber) || []
        groupMap.set(user.groupNumber, [...currentGroup, user])
      })

    const groups = [...groupMap.entries()].map(([groupNumber, members]) => ({
      id: `group-${groupNumber}`,
      groupNumber,
      members: sortByBirthYear(members),
    }))

    return {
      groups: sortGroups(groups),
      unassignedUsers,
    }
  }

  function syncGroupNumberDrafts(groups: Array<DraftGroup>) {
    setGroupNumberDrafts(
      groups.reduce<Record<string, string>>((accumulator, group) => {
        accumulator[group.id] = String(group.groupNumber)
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
    get("/retreat/admin/get-retreat-group-formation")
      .then((response: Array<RetreatAttend>) => {
        const nextState = normalizeResponse(response)
        setDraftState(nextState)
        syncGroupNumberDrafts(nextState.groups)
        setIsDirty(false)
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
    nextState.groups.forEach((group) => {
      group.members.forEach((user) => {
        usersById.set(user.id, user)
      })
    })

    setIsSaving(true)

    try {
      await Promise.all(
        [...usersById.values()].map((selectedUser) =>
          post("/retreat/admin/set-retreat-group", {
            selectedUser,
          }),
        ),
      )
      setIsDirty(false)
    } catch {
      error("조 저장에 실패했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  function setDraftStateAndMarkDirty(
    updater: (prev: DraftState) => DraftState,
    autoSave = false,
  ) {
    setDraftState((prev) => {
      const next = updater(prev)
      if (next !== prev) {
        setIsDirty(true)
        if (autoSave) {
          void persistDraftState(next)
        }
      }
      return next
    })
  }

  function getCurrentGroupNumber(state: DraftState, userId: string) {
    if (state.unassignedUsers.some((user) => user.id === userId)) {
      return 0
    }

    const currentGroup = state.groups.find((group) =>
      group.members.some((user) => user.id === userId),
    )

    return currentGroup?.groupNumber || 0
  }

  function moveUserToGroup(
    state: DraftState,
    userId: string,
    nextGroupNumber: number,
  ) {
    const currentGroupNumber = getCurrentGroupNumber(state, userId)
    if (currentGroupNumber === nextGroupNumber) {
      return state
    }

    const nextState: DraftState = {
      groups: state.groups.map((group) => ({
        ...group,
        members: [...group.members],
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
      for (const group of nextState.groups) {
        const userIndex = group.members.findIndex((user) => user.id === userId)
        if (userIndex !== -1) {
          movingUser = group.members.splice(userIndex, 1)[0]
          break
        }
      }
    }

    if (!movingUser) {
      return state
    }

    const movedUser = { ...movingUser, groupNumber: nextGroupNumber }

    if (nextGroupNumber === 0) {
      nextState.unassignedUsers = sortByBirthYear([
        ...nextState.unassignedUsers,
        movedUser,
      ])
    } else {
      const targetGroup = nextState.groups.find(
        (group) => group.groupNumber === nextGroupNumber,
      )

      if (targetGroup) {
        targetGroup.members = sortByBirthYear([
          ...targetGroup.members,
          movedUser,
        ])
      } else {
        nextState.groups.push({
          id: `group-${nextGroupNumber}-${movingUser.id}`,
          groupNumber: nextGroupNumber,
          members: [movedUser],
        })
      }
    }

    nextState.groups = sortGroups(
      nextState.groups.map((group) => ({
        ...group,
        members: sortByBirthYear(group.members),
      })),
    )
    nextState.unassignedUsers = sortByBirthYear(nextState.unassignedUsers)

    return nextState
  }

  function applyDrop(nextGroupNumber: number) {
    if (!selectedUser) {
      return
    }

    setDraftStateAndMarkDirty(
      (prevState) =>
        moveUserToGroup(prevState, selectedUser.id, nextGroupNumber),
      true,
    )
    setSelectedUser(undefined)
  }

  function addGroup() {
    setDraftStateAndMarkDirty((prevState) => {
      const usedNumbers = new Set(
        prevState.groups.map((group) => group.groupNumber),
      )
      let nextGroupNumber = 1

      while (usedNumbers.has(nextGroupNumber)) {
        nextGroupNumber += 1
      }

      return {
        ...prevState,
        groups: sortGroups([
          ...prevState.groups,
          {
            id: `group-${nextGroupNumber}-${Date.now()}`,
            groupNumber: nextGroupNumber,
            members: [],
          },
        ]),
      }
    })
    setGroupNumberDrafts((prevDrafts) => ({
      ...prevDrafts,
    }))
  }

  function removeGroup(groupId: string) {
    setDraftStateAndMarkDirty((prevState) => {
      const targetGroup = prevState.groups.find((group) => group.id === groupId)
      if (!targetGroup) {
        return prevState
      }

      return {
        groups: prevState.groups.filter((group) => group.id !== groupId),
        unassignedUsers: sortByBirthYear([
          ...prevState.unassignedUsers,
          ...targetGroup.members.map((user) => ({
            ...user,
            groupNumber: 0,
          })),
        ]),
      }
    }, true)
    setGroupNumberDrafts((prevDrafts) => {
      const nextDrafts = { ...prevDrafts }
      delete nextDrafts[groupId]
      return nextDrafts
    })
  }

  function renameGroup(groupId: string, nextGroupNumber: number) {
    if (!Number.isFinite(nextGroupNumber) || nextGroupNumber <= 0) {
      return
    }

    setDraftStateAndMarkDirty((prevState) => {
      const sourceGroup = prevState.groups.find((group) => group.id === groupId)
      if (!sourceGroup || sourceGroup.groupNumber === nextGroupNumber) {
        return prevState
      }

      const targetGroup = prevState.groups.find(
        (group) =>
          group.groupNumber === nextGroupNumber && group.id !== groupId,
      )

      if (targetGroup) {
        const mergedMembers = sortByBirthYear([
          ...targetGroup.members,
          ...sourceGroup.members.map((user) => ({
            ...user,
            groupNumber: nextGroupNumber,
          })),
        ])

        return {
          ...prevState,
          groups: sortGroups(
            prevState.groups
              .filter((group) => group.id !== groupId)
              .map((group) =>
                group.id === targetGroup.id
                  ? {
                      ...group,
                      groupNumber: nextGroupNumber,
                      members: mergedMembers,
                    }
                  : group,
              ),
          ),
        }
      }

      return {
        ...prevState,
        groups: sortGroups(
          prevState.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  groupNumber: nextGroupNumber,
                  members: sortByBirthYear(
                    group.members.map((user) => ({
                      ...user,
                      groupNumber: nextGroupNumber,
                    })),
                  ),
                }
              : group,
          ),
        ),
      }
    }, true)

    setGroupNumberDrafts((prevDrafts) => {
      const nextDrafts = { ...prevDrafts }
      delete nextDrafts[groupId]
      nextDrafts[groupId] = String(nextGroupNumber)
      return nextDrafts
    })
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
          {retreatAttend.user.etc || retreatAttend.isHalf ? " (부참)" : ""}
        </Box>
      </Stack>
    )
  }

  function renderGroup(group: DraftGroup) {
    return (
      <Stack
        key={group.id}
        sx={{
          margin: "8px",
          minHeight: "20px",
          borderRadius: "8px",
          border: "1px solid #ACACAC",
          boxShadow: "2px 2px 5px 3px #ACACAC;",
          backgroundColor: "#fff",
        }}
        onMouseUp={() => {
          applyDrop(group.groupNumber)
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
            value={groupNumberDrafts[group.id] ?? String(group.groupNumber)}
            onChange={(event) => {
              setGroupNumberDrafts((prevDrafts) => ({
                ...prevDrafts,
                [group.id]: event.target.value,
              }))
            }}
            onBlur={(event) => {
              const nextGroupNumber = Number(event.target.value)
              renameGroup(group.id, nextGroupNumber)
            }}
            inputProps={{ min: 1, step: 1 }}
            sx={{ width: "60px" }}
          />
          조 <Box whiteSpace="nowrap">({group.members.length}명)</Box>
          <IconButton
            size="small"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              removeGroup(group.id)
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack gap="4px" px="6px" pb="6px" minWidth="160px">
          {group.members.length === 0 ? (
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
            group.members.map((user) => renderUserRow(user))
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
          borderRadius: "12px",
          position: "absolute",
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
    <Stack sx={{ overflowX: "hidden" }}>
      <Header />
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
        px="12px"
        py="8px"
      >
        <Stack>
          <Box fontSize="18px" fontWeight={700}>
            조 편성
          </Box>
          <Box fontSize="13px" color="#666">
            조의 번호를 수정하면 사용자가 한번에 이동합니다.
          </Box>
        </Stack>
        <Stack direction="row" gap="8px" alignItems="center">
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
            onClick={addGroup}
            disabled={isSaving}
          >
            조 추가
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row">
        {modal()}
        <Stack
          style={{
            margin: "6px",
            minHeight: "20px",
            borderRadius: "8px",
            paddingBottom: "20px",
            boxShadow: "2px 2px 5px 3px #ACACAC;",
            border: "1px solid #ACACAC",
          }}
          onMouseUp={() => {
            applyDrop(0)
          }}
          width="170px"
        >
          <Box textAlign="center" py="4px">
            미배정({draftState.unassignedUsers.length}명)
          </Box>
          <Stack gap="4px" px="6px">
            {draftState.unassignedUsers.map((user) => renderUserRow(user))}
          </Stack>
        </Stack>
        <Stack
          style={{
            flexWrap: "wrap",
            margin: "4px",
            width: "calc(100% - 200px)",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {draftState.groups.map((group) => renderGroup(group))}
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

export default GroupFormation

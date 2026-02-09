"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { get, post } from "../../../../config/api"
import { User } from "@server/entity/user"
import {
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useSetAtom } from "jotai"
import { PermissionType } from "@server/entity/types"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"

function PermissionManage() {
  const { push } = useRouter()
  const [userList, setUserList] = useState([] as Array<User>)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userPermission, setUserPermission] = useState<{
    [key: number]: boolean
  }>({})
  const { error } = useNotification()

  useEffect(() => {
    get("/retreat/admin/get-all-user-name")
      .then((response: Array<User>) => {
        setUserList(response.sort((a, b) => (a.name > b.name ? 1 : -1)))
        if (response.length > 0) {
          setSelectedUserId(response[0].id)
        }
      })
      .catch(() => {
        push("/retreat/admin")
        error("권한이 없습니다.")
        return
      })
  }, [])

  useEffect(() => {
    loadUserPermission()
  }, [selectedUserId])

  function onClickUser(event: SelectChangeEvent<string>) {
    setSelectedUserId(event.target.value)
  }

  const permissionKrString = {
    [PermissionType.admin]: "준비팀",
    [PermissionType.carpooling]: "카풀",
    [PermissionType.permissionManage]: "권한 관리",
    [PermissionType.userList]: "사용자 목록",
    [PermissionType.showRoomAssignment]: "방배정 조회",
    [PermissionType.showGroupAssignment]: "조편성 조회",
    [PermissionType.roomManage]: "방배정",
    [PermissionType.groupManage]: "조편성",
    [PermissionType.deposit]: "입금 처리",
    [PermissionType.editUserData]: "정보 수정",
    [PermissionType.deleteUser]: "접수 삭제",
    [PermissionType.mediaManage]: "미디어 관리",
  }

  function loadUserPermission() {
    post("/retreat/admin/get-user-permission-info", {
      userId: selectedUserId,
    }).then((response) => {
      const data: { [key: number]: boolean } = {}
      response.map(
        (permission: { permissionType: number; have: boolean }) =>
          (data[permission.permissionType] = permission.have),
      )
      setUserPermission(data)
    })
  }

  function onChangePermission(
    event: ChangeEvent<HTMLInputElement>,
    key: number,
  ) {
    post("/retreat/admin/set-user-permission", {
      userId: selectedUserId,
      have: event.target.value === "true",
      permissionType: key,
    }).then(() => {
      loadUserPermission()
    })
  }

  return (
    <Stack>
      <Header />
      <Stack margin="8px">
        관리 할 사람 선택
        <Stack m="4px" />
        <Select value={selectedUserId} onChange={onClickUser}>
          {userList.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name} ({user.yearOfBirth})
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack display="flex" flexWrap="wrap" direction="row">
        {Object.entries(permissionKrString).map(([key, krName]) => (
          <Stack
            key={key}
            margin="8px"
            style={{
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #ACACAC",
            }}
          >
            <RadioGroup
              value={!!userPermission[Number(key)]}
              onChange={(e) => onChangePermission(e, Number(key))}
            >
              <FormLabel>{krName}</FormLabel>
              <FormControlLabel value={true} control={<Radio />} label="있음" />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label="없음"
              />
            </RadioGroup>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

export default PermissionManage

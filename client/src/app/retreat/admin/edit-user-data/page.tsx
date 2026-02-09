"use client"

import { get, post } from "@/config/api"
import { useEffect, useState } from "react"
import {
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material"
import UserInformationForm from "@/components/form/UserInformationForm"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import Header from "@/components/retreat/admin/Header"
import { useNotification } from "@/hooks/useNotification"

export default function EditUserData() {
  const { push } = useRouter()
  const [userList, setUserList] = useState([] as Array<RetreatAttend>)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [retreatAttend, setRetreatAttend] = useState<RetreatAttend | undefined>(
    undefined,
  )
  const { error, success } = useNotification()

  useEffect(() => {
    get("/retreat/admin/get-all-user")
      .then((response: Array<RetreatAttend>) => {
        setUserList(
          response.sort((a, b) => (a.user.name > b.user.name ? 1 : -1)),
        )
        if (global.location.search) {
          const retreatAttendId = new URLSearchParams(
            global.location.search,
          ).get("retreatAttendId")
          setSelectedUserId(retreatAttendId ? retreatAttendId : "")
        } else if (response.length > 0) {
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
    loadData(selectedUserId)
  }, [selectedUserId])

  function onClickUser(event: SelectChangeEvent<string>) {
    setSelectedUserId(event.target.value)
  }

  function loadData(targetUserId: string = "") {
    const userId = !targetUserId ? selectedUserId : targetUserId

    get(`/retreat/admin/get-user-data?userId=${userId}`).then((response) => {
      if (response.result === "true") {
        setRetreatAttend(response.userData)
      }
    })
  }

  async function deleteUser() {
    const c = confirm(
      `${
        userList.find((retreatAttend) => retreatAttend.id === selectedUserId)
          ?.user.name
      }의 정보를 삭제하시겠습니까?`,
    )
    if (!c) {
      return
    }
    const { result } = await post("/retreat/admin/delete-user", {
      userId: selectedUserId,
    })

    if (result === "success") {
      success("삭제되었습니다.")
    }
  }

  return (
    <Stack justifyContent="center">
      <Header />
      <Stack margin="8px" color="white">
        수정 할 사람 선택
        <Stack m="4px" />
        <Select value={selectedUserId} onChange={onClickUser}>
          {userList.map((retreatAttend) => (
            <MenuItem key={retreatAttend.id} value={retreatAttend.id}>
              {retreatAttend.user.name} ({retreatAttend.user.yearOfBirth})
              {retreatAttend.etc ? "*" : ""}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Stack p="8x" border="1px solid grey" m="8px" borderRadius="12px">
        <UserInformationForm
          retreatAttend={retreatAttend}
          reloadFunction={loadData}
          setEditMode={() => {}}
        />
      </Stack>
      <Box height="50px" />
      {selectedUserId && (
        <Stack m="12px" flex={1}>
          <Button variant="contained" color="error" onClick={deleteUser}>
            접수 삭제
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

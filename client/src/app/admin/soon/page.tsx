"use client"

import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import { User } from "@server/entity/user"
import UserFilter from "./UserFilter"
import UserTable from "./UserTable"
import UserForm from "./UserForm"
import { get, post, put, dele } from "@/config/api"
import { NotificationMessage } from "@/state/notification"

const emptyUser = {
  id: "",
  name: "",
  yearOfBirth: 0,
  phone: "",
  gender: "man",
  etc: "",
} as User

export default function Soon() {
  const [userList, setUserList] = useState<User[]>([])
  const [selectedUser, setSelectedUsers] = useState<User>(emptyUser)
  const [orderProperty, setOrderProperty] = useState<keyof User>("name")
  const [direction, setDirection] = useState<"asc" | "desc">("asc")
  const setNotificationMessage = useSetAtom(NotificationMessage)

  // 필터 상태
  const [filterName, setFilterName] = useState("")
  const [filterGender, setFilterGender] = useState<"" | "man" | "woman">("")
  const [filterMinYear, setFilterMinYear] = useState("")
  const [filterMaxYear, setFilterMaxYear] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const data = await get("/admin/soon/get-all-user")
    setUserList(data)
  }

  function clearSelectedUser() {
    setSelectedUsers(emptyUser)
  }

  function onChangeData(key: string, value: string) {
    setSelectedUsers({ ...selectedUser, [key]: value })
  }

  async function saveData() {
    try {
      if (selectedUser.id) {
        await put("/admin/soon/update-user", selectedUser)
        setNotificationMessage("사용자 정보가 수정되었습니다.")
      } else {
        await post("/admin/soon/insert-user", selectedUser)
        setNotificationMessage("새 사용자가 추가되었습니다.")
      }
      await fetchData()
    } catch (error) {
      setNotificationMessage("저장 중 오류가 발생했습니다.")
    }
  }

  async function deleteUser() {
    if (selectedUser.id && confirm("정말로 삭제하시겠습니까?")) {
      try {
        await dele(`/admin/soon/delete-user/${selectedUser.id}`, {})
        setNotificationMessage("사용자가 삭제되었습니다.")
        clearSelectedUser()
        await fetchData()
      } catch (error) {
        setNotificationMessage("삭제 중 오류가 발생했습니다.")
      }
    }
  }

  function clearFilters() {
    setFilterName("")
    setFilterGender("")
    setFilterMinYear("")
    setFilterMaxYear("")
  }

  function orderingUserList() {
    return userList
      .filter((user) => {
        if (!user.name) return false

        if (
          filterName &&
          !user.name.toLowerCase().includes(filterName.toLowerCase())
        ) {
          return false
        }

        if (filterGender && user.gender !== filterGender) {
          return false
        }

        if (filterMinYear && user.yearOfBirth < parseInt(filterMinYear)) {
          return false
        }
        if (filterMaxYear && user.yearOfBirth > parseInt(filterMaxYear)) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (orderProperty === "name") {
          if (direction === "asc") {
            return a.name.localeCompare(b.name)
          }
          return b.name.localeCompare(a.name)
        }
        if (orderProperty === "yearOfBirth") {
          if (direction === "asc") {
            return a.yearOfBirth - b.yearOfBirth
          }
          return b.yearOfBirth - a.yearOfBirth
        }
        if (orderProperty === "phone") {
          if (direction === "asc") {
            return a.phone.localeCompare(b.phone)
          }
          return b.phone.localeCompare(a.phone)
        }
        if (orderProperty === "gender") {
          if (direction === "asc") {
            return a.gender.localeCompare(b.gender)
          }
          return b.gender.localeCompare(a.gender)
        }
        return 0
      })
  }

  function handleSortClick(property: keyof User) {
    if (orderProperty === property) {
      setDirection(direction === "asc" ? "desc" : "asc")
    } else {
      setOrderProperty(property)
      setDirection("asc")
    }
  }

  const filteredUsers = orderingUserList()

  return (
    <Stack>
      <Stack direction="row" p="12px" gap="12px">
        <UserTable
          userList={userList}
          filteredUserList={filteredUsers}
          orderProperty={orderProperty}
          direction={direction}
          onSortClick={handleSortClick}
          onUserSelect={setSelectedUsers}
        />
        <Stack width="50%">
          <UserFilter
            filterName={filterName}
            setFilterName={setFilterName}
            filterGender={filterGender}
            setFilterGender={setFilterGender}
            filterMinYear={filterMinYear}
            setFilterMinYear={setFilterMinYear}
            filterMaxYear={filterMaxYear}
            setFilterMaxYear={setFilterMaxYear}
            clearFilters={clearFilters}
          />
          <UserForm
            selectedUser={selectedUser}
            onDataChange={onChangeData}
            onSave={saveData}
            onDelete={deleteUser}
            onClear={clearSelectedUser}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

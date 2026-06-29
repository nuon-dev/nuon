"use client"

import axios from "@/config/axios"
import { Stack } from "@mui/material"
import { PermissionType, permissionTypeToString } from "@server/entity/types"
import { User } from "@server/entity/user"
import { some } from "lodash"
import { useEffect, useState } from "react"

export default function PermissionManage() {
  const [userList, setUserList] = useState([] as Array<User>)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUserList()
  }, [])

  async function loadUserList() {
    const { data } = await axios.get<User[]>("/admin/permission/get-all-user")
    data.sort((a, b) => a.name.localeCompare(b.name))
    data.sort((a, b) => b.permissions.length - a.permissions.length)
    setUserList(data)
  }

  async function setPermission(userId: string, permissionType: PermissionType) {
    await axios.post("/admin/permission/set-user-permission", {
      userId,
      permissionType,
    })
    loadUserList()
  }

  async function removePermission(
    userId: string,
    permissionType: PermissionType,
  ) {
    await axios.delete("/admin/permission/delete-user-permission", {
      data: {
        userId,
        permissionType,
      },
    })
    loadUserList()
  }

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="center"
      justifyContent="center"
    >
      <Stack>{selectedUser?.name}</Stack>
      <Stack direction="row" spacing={2}>
        <Stack>
          {userList.map((user) => (
            <Stack
              key={user.id}
              direction="row"
              onClick={() => setSelectedUser(user)}
              spacing={2}
            >
              <div>{user.name}</div>
              <div>({user.yearOfBirth})</div>
              <div> / ({user.permissions.length})</div>
            </Stack>
          ))}
        </Stack>

        <Stack>
          {Object.values(PermissionType).map((permissionType) => (
            <Stack key={permissionType} direction="row" spacing={2}>
              <div>{permissionType}</div>
              <div>{permissionTypeToString(permissionType)}</div>
              <div>
                {some(selectedUser?.permissions, {
                  permissionType,
                }) ? (
                  <button
                    onClick={() =>
                      removePermission(selectedUser!.id, permissionType)
                    }
                  >
                    권한 제거
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setPermission(selectedUser!.id, permissionType)
                    }
                  >
                    권한 추가
                  </button>
                )}
              </div>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

"use client"

import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import axios from "@/config/axios"
import { NotificationMessage } from "@/state/notification"
import useAuth from "@/hooks/useAuth"
import NewcomerTable from "./NewcomerTable"
import NewcomerFilter from "./NewcomerFilter"
import NewcomerForm from "./NewcomerForm"

interface Newcomer {
  id: string
  name: string
  yearOfBirth: number | null
  phone: string | null
  gender: "man" | "woman" | "" | null
  status: string
  guider: { id: string; name: string } | null
  newcomerManager: {
    id: string
    user: { id: string; name: string }
  } | null
  assignment: { id: number; name: string } | null
  createdAt: string
}

const emptyNewcomer: Newcomer = {
  id: "",
  name: "",
  yearOfBirth: null,
  phone: null,
  gender: "man",
  status: "NORMAL",
  guider: null,
  newcomerManager: null,
  assignment: null,
  createdAt: "",
}

export default function NewcomerManagement() {
  const { isLeaderIfNotExit } = useAuth()
  const [newcomerList, setNewcomerList] = useState<Newcomer[]>([])
  const [selectedNewcomer, setSelectedNewcomer] =
    useState<Newcomer>(emptyNewcomer)
  const [orderProperty, setOrderProperty] = useState<string>("name")
  const [direction, setDirection] = useState<"asc" | "desc">("asc")
  const setNotificationMessage = useSetAtom(NotificationMessage)

  // 필터 상태
  const [filterName, setFilterName] = useState("")
  const [filterGender, setFilterGender] = useState<"" | "man" | "woman">("")
  const [filterMinYear, setFilterMinYear] = useState("")
  const [filterMaxYear, setFilterMaxYear] = useState("")

  useEffect(() => {
    isLeaderIfNotExit("/leader/newcomer/management")
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data } = await axios.get<Newcomer[]>("/newcomer")
      setNewcomerList(data)
    } catch (error) {
      console.error("Error fetching newcomers:", error)
      setNotificationMessage("새신자 목록 조회에 실패했습니다.")
    }
  }

  function clearSelectedNewcomer() {
    setSelectedNewcomer(emptyNewcomer)
  }

  function onChangeData(key: string, value: any) {
    setSelectedNewcomer({ ...selectedNewcomer, [key]: value })
  }

  async function saveData() {
    try {
      if (selectedNewcomer.id) {
        // TODO: 수정 API 구현 필요
        // await axios.put(`/newcomer/${selectedNewcomer.id}`, selectedNewcomer)
        setNotificationMessage("새신자 정보가 수정되었습니다.")
      } else {
        await axios.post("/newcomer", {
          name: selectedNewcomer.name,
          yearOfBirth: selectedNewcomer.yearOfBirth,
          gender: selectedNewcomer.gender,
          phone: selectedNewcomer.phone,
        })
        setNotificationMessage("새신자가 추가되었습니다.")
      }
      await fetchData()
      clearSelectedNewcomer()
    } catch (error) {
      setNotificationMessage("저장 중 오류가 발생했습니다.")
    }
  }

  async function deleteNewcomer() {
    if (selectedNewcomer.id && confirm("정말로 삭제하시겠습니까?")) {
      try {
        // TODO: 삭제 API 구현 필요
        // await axios.delete(`/newcomer/${selectedNewcomer.id}`)
        setNotificationMessage("새신자가 삭제되었습니다.")
        clearSelectedNewcomer()
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

  function orderingNewcomerList() {
    return newcomerList
      .filter((newcomer) => {
        if (!newcomer.name) return false

        if (
          filterName &&
          !newcomer.name.toLowerCase().includes(filterName.toLowerCase())
        ) {
          return false
        }

        if (filterGender && newcomer.gender !== filterGender) {
          return false
        }

        if (
          filterMinYear &&
          newcomer.yearOfBirth &&
          newcomer.yearOfBirth < parseInt(filterMinYear)
        ) {
          return false
        }
        if (
          filterMaxYear &&
          newcomer.yearOfBirth &&
          newcomer.yearOfBirth > parseInt(filterMaxYear)
        ) {
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
          const aYear = a.yearOfBirth || 0
          const bYear = b.yearOfBirth || 0
          if (direction === "asc") {
            return aYear - bYear
          }
          return bYear - aYear
        }
        return 0
      })
  }

  function handleSortClick(property: string) {
    if (orderProperty === property) {
      setDirection(direction === "asc" ? "desc" : "asc")
    } else {
      setOrderProperty(property)
      setDirection("asc")
    }
  }

  const filteredNewcomers = orderingNewcomerList()

  return (
    <Stack>
      <Stack direction="row" p="12px" gap="12px">
        <NewcomerTable
          newcomerList={newcomerList}
          filteredNewcomerList={filteredNewcomers}
          orderProperty={orderProperty}
          direction={direction}
          onSortClick={handleSortClick}
          onNewcomerSelect={setSelectedNewcomer}
        />
        <Stack width="50%">
          <NewcomerFilter
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
          <NewcomerForm
            selectedNewcomer={selectedNewcomer}
            onDataChange={onChangeData}
            onSave={saveData}
            onDelete={deleteNewcomer}
            onClear={clearSelectedNewcomer}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

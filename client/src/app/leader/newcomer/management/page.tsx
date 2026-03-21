"use client"

import {
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material"
import { useEffect, useState } from "react"
import axios from "@/config/axios"
import { useNotification } from "@/hooks/useNotification"
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
  status: "NORMAL" | "PROMOTED" | "PENDING" | "DELETED"
  guider: { id: string; name: string } | null
  newcomerManager: {
    id: string
    user: { id: string; name: string }
  } | null
  assignment: { id: number; name: string } | null
  createdAt: string
  deletedAt?: string | null
  pendingDate?: string | null
  promotionDate?: string | null
  address: string | null
  occupation: string | null
  visitPath: string | null
  registrationMotivation: string | null
  faithLevel: "초신자" | "세례" | "입교" | "학습" | null
  previousChurch: string | null
  carNumber: string | null
}

interface Manager {
  id: string
  user: { id: string; name: string }
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
  deletedAt: null,
  pendingDate: null,
  promotionDate: null,
  address: null,
  occupation: null,
  visitPath: null,
  registrationMotivation: null,
  faithLevel: null,
  previousChurch: null,
  carNumber: null,
}

export default function NewcomerManagement() {
  const { isLeaderIfNotExit } = useAuth()
  const [newcomerList, setNewcomerList] = useState<Newcomer[]>([])
  const [selectedNewcomer, setSelectedNewcomer] =
    useState<Newcomer>(emptyNewcomer)
  const [orderProperty, setOrderProperty] = useState<string>("name")
  const [direction, setDirection] = useState<"asc" | "desc">("asc")
  const notification = useNotification()

  // 필터 상태
  const [filterName, setFilterName] = useState("")
  const [filterGender, setFilterGender] = useState<"" | "man" | "woman">("")
  const [filterMinYear, setFilterMinYear] = useState("")
  const [filterMaxYear, setFilterMaxYear] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [managerList, setManagerList] = useState<Manager[]>([])

  // 날짜 선택 다이얼로그 상태
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [dateDialogType, setDateDialogType] = useState<
    "pending" | "promotion" | "delete" | ""
  >("")
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    isLeaderIfNotExit("/leader/newcomer/management")
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [newcomerRes, managerRes] = await Promise.all([
        axios.get<Newcomer[]>("/newcomer"),
        axios.get<Manager[]>("/newcomer/managers"),
      ])
      setNewcomerList(newcomerRes.data)
      setManagerList(managerRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      notification.error("데이터 조회에 실패했습니다.")
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
        await axios.put(`/newcomer/${selectedNewcomer.id}`, {
          name: selectedNewcomer.name,
          yearOfBirth: selectedNewcomer.yearOfBirth,
          gender: selectedNewcomer.gender,
          phone: selectedNewcomer.phone,
          newcomerManagerId: selectedNewcomer.newcomerManager?.id || null,
          guiderId: selectedNewcomer.guider?.id || null,
          assignmentId: selectedNewcomer.assignment?.id || null,
          status: selectedNewcomer.status,
          pendingDate: selectedNewcomer.pendingDate,
          promotionDate: selectedNewcomer.promotionDate,
          address: selectedNewcomer.address,
          occupation: selectedNewcomer.occupation,
          visitPath: selectedNewcomer.visitPath,
          registrationMotivation: selectedNewcomer.registrationMotivation,
          faithLevel: selectedNewcomer.faithLevel,
          previousChurch: selectedNewcomer.previousChurch,
          carNumber: selectedNewcomer.carNumber,
        })
        notification.success("새신자 정보가 수정되었습니다.")
      } else {
        await axios.post("/newcomer", {
          name: selectedNewcomer.name,
          yearOfBirth: selectedNewcomer.yearOfBirth,
          gender: selectedNewcomer.gender,
          phone: selectedNewcomer.phone,
          newcomerManagerId: selectedNewcomer.newcomerManager?.id || null,
          address: selectedNewcomer.address,
          occupation: selectedNewcomer.occupation,
          visitPath: selectedNewcomer.visitPath,
          registrationMotivation: selectedNewcomer.registrationMotivation,
          faithLevel: selectedNewcomer.faithLevel,
          previousChurch: selectedNewcomer.previousChurch,
          carNumber: selectedNewcomer.carNumber,
        })
        notification.success("새신자가 추가되었습니다.")
      }
      await fetchData()
      clearSelectedNewcomer()
    } catch (err) {
      notification.error("저장 중 오류가 발생했습니다.")
    }
  }

  async function deleteNewcomer() {
    if (selectedNewcomer.id) {
      const today = new Date().toISOString().split("T")[0]
      setSelectedDate(today)
      setDateDialogType("delete")
      setDateDialogOpen(true)
    }
  }

  async function pendingNewcomer() {
    if (selectedNewcomer.id) {
      const today = new Date().toISOString().split("T")[0]
      setSelectedDate(today)
      setDateDialogType("pending")
      setDateDialogOpen(true)
    }
  }

  async function promoteNewcomer() {
    if (selectedNewcomer.id) {
      const today = new Date().toISOString().split("T")[0]
      setSelectedDate(today)
      setDateDialogType("promotion")
      setDateDialogOpen(true)
    }
  }

  async function handleDateConfirm() {
    if (!selectedDate) {
      notification.error("날짜를 선택해주세요.")
      return
    }

    try {
      if (dateDialogType === "delete") {
        await axios.delete(`/newcomer/${selectedNewcomer.id}`)
        notification.success("새신자가 삭제되었습니다.")
        clearSelectedNewcomer()
      } else if (dateDialogType === "pending") {
        await axios.put(`/newcomer/${selectedNewcomer.id}`, {
          ...selectedNewcomer,
          status: "PENDING",
          pendingDate: selectedDate,
        })
        notification.success("새신자가 보류 처리되었습니다.")
      } else if (dateDialogType === "promotion") {
        await axios.put(`/newcomer/${selectedNewcomer.id}`, {
          ...selectedNewcomer,
          status: "PROMOTED",
          promotionDate: selectedDate,
        })
        notification.success("새신자가 등반 처리되었습니다.")
      }

      setDateDialogOpen(false)
      setDateDialogType("")
      setSelectedDate("")
      await fetchData()
    } catch (err) {
      notification.error("처리 중 오류가 발생했습니다.")
    }
  }

  function clearFilters() {
    setFilterName("")
    setFilterGender("")
    setFilterMinYear("")
    setFilterMaxYear("")
    setFilterStatus("")
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

        if (filterStatus && newcomer.status !== filterStatus) {
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
        <Stack width="40%">
          <NewcomerFilter
            filterName={filterName}
            setFilterName={setFilterName}
            filterGender={filterGender}
            setFilterGender={setFilterGender}
            filterMinYear={filterMinYear}
            setFilterMinYear={setFilterMinYear}
            filterMaxYear={filterMaxYear}
            setFilterMaxYear={setFilterMaxYear}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            clearFilters={clearFilters}
          />
          <NewcomerForm
            selectedNewcomer={selectedNewcomer}
            onDataChange={onChangeData}
            onSave={saveData}
            onDelete={deleteNewcomer}
            onPending={pendingNewcomer}
            onPromote={promoteNewcomer}
            onClear={clearSelectedNewcomer}
            managerList={managerList}
          />
        </Stack>
      </Stack>

      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
        <DialogTitle>
          {dateDialogType === "pending"
            ? "보류 처리"
            : dateDialogType === "promotion"
              ? "등반 처리"
              : "삭제 처리"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={
              dateDialogType === "pending"
                ? "보류일"
                : dateDialogType === "promotion"
                  ? "등반일"
                  : "삭제일"
            }
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateDialogOpen(false)}>취소</Button>
          <Button onClick={handleDateConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

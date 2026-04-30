"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Stack,
  Typography,
  TextField,
  Checkbox,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HelpIcon from "@mui/icons-material/Help"
import CloseIcon from "@mui/icons-material/Close"

import axios from "@/config/axios"
import { get } from "@/config/api"
import { AttendData } from "@server/entity/attendData"
import { AttendStatus } from "@server/entity/types"
import { Community } from "@server/entity/community"
import { User } from "@server/entity/user"
import { WorshipSchedule } from "@server/entity/worshipSchedule"
import { worshipKr } from "@/util/worship"
import {
  BulkAttendanceResponse,
  toAttendanceErrorMessage,
  toBulkResultMessage,
} from "@/util/attendanceError"
import { useNotification } from "@/hooks/useNotification"

type StatusFilter = "all" | "unrecorded" | "ATTEND" | "ABSENT" | "ETC"

export default function EditTab() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | "">("")
  const [attendData, setAttendData] = useState<AttendData[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchText, setSearchText] = useState("")
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  // 4단 drill-down: 담당(d1) → 마을(d2) → 다락방(d3) → 순원(user)
  const [focusedDangId, setFocusedDangId] = useState<number | null>(null)
  const [focusedVillageId, setFocusedVillageId] = useState<number | null>(null)
  const [focusedDarakId, setFocusedDarakId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Phase 3: Undo 스낵바
  const [undoAction, setUndoAction] = useState<{
    userIds: string[]
    previousStates: Map<string, { status: StatusFilter; memo: string }>
    newStatus: AttendStatus
    scheduleId: number
  } | null>(null)

  const [memoDialog, setMemoDialog] = useState<{
    status: AttendStatus
    memo: string
  } | null>(null)

  const { success, error } = useNotification()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"))

  // 초기 로드
  useEffect(() => {
    ;(async () => {
      try {
        const [commData, schedResp] = await Promise.all([
          get("/admin/community"),
          axios.get<WorshipSchedule[]>("/soon/worship-schedule"),
        ])
        setCommunities(commData)
        setSchedules(schedResp.data)
        if (schedResp.data.length > 0) {
          setSelectedScheduleId(schedResp.data[0].id)
        }
      } catch (e) {
        error("데이터 로드 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (communities.length === 0) return
    const topIds = communities
      .filter((c) => !c.parent)
      .map((c) => c.id)
      .join(",")
    if (!topIds) return
    axios
      .post<User[]>("/admin/soon/get-soon-list", { ids: topIds })
      .then((resp) => setAllUsers(resp.data))
  }, [communities])

  useEffect(() => {
    if (allUsers.length === 0 || !selectedScheduleId) return
    const userIds = allUsers.map((u) => u.id).join(",")
    axios
      .post<AttendData[]>("/admin/soon/user-attendance", { ids: userIds })
      .then((resp) => {
        const filtered = resp.data.filter(
          (d) => d.worshipSchedule.id === selectedScheduleId,
        )
        setAttendData(filtered)
      })
  }, [allUsers, selectedScheduleId])

  // Memos
  const attendMap = useMemo(() => {
    const m = new Map<string, AttendData>()
    attendData.forEach((d) => m.set(d.user.id, d))
    return m
  }, [attendData])

  const parentMap = useMemo(() => {
    const m = new Map<number, number | null>()
    communities.forEach((c) => m.set(c.id, c.parent?.id ?? null))
    return m
  }, [communities])

  const nameMap = useMemo(() => {
    const m = new Map<number, string>()
    communities.forEach((c) => m.set(c.id, c.name))
    return m
  }, [communities])

  function getUserStatus(userId: string): StatusFilter {
    const d = attendMap.get(userId)
    if (!d) return "unrecorded"
    return d.isAttend as StatusFilter
  }

  // 트리 끝까지 거슬러 올라가 d1(담당) id 반환
  function findDangId(communityId: number): number {
    let cur = communityId
    for (let i = 0; i < 10; i++) {
      const parent = parentMap.get(cur)
      if (parent === null || parent === undefined) return cur
      cur = parent
    }
    return cur
  }

  // d2(마을) id: 부모가 d1인 노드. user.community가 d1이면 null.
  function findVillageId(communityId: number): number | null {
    let cur = communityId
    for (let i = 0; i < 10; i++) {
      const parent = parentMap.get(cur)
      if (parent === null || parent === undefined) return null
      const grand = parentMap.get(parent)
      if (grand === null || grand === undefined) return cur
      cur = parent
    }
    return null
  }

  // d3(다락방) id: 부모의 부모가 d1인 노드. user.community가 d2 이상이면 null.
  function findDarakId(communityId: number): number | null {
    let cur = communityId
    for (let i = 0; i < 10; i++) {
      const parent = parentMap.get(cur)
      if (parent === null || parent === undefined) return null
      const grand = parentMap.get(parent)
      if (grand === null || grand === undefined) return null
      const ggrand = parentMap.get(grand)
      if (ggrand === null || ggrand === undefined) return cur
      cur = parent
    }
    return null
  }

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const status = getUserStatus(u.id)
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (searchText && !(u.name || "").includes(searchText)) return false
      return true
    })
  }, [allUsers, statusFilter, searchText, attendMap])

  // 담당별 user 매핑 (subtree 합)
  const usersByDang = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      const id = findDangId(u.community.id)
      if (!m.has(id)) m.set(id, [])
      m.get(id)!.push(u)
    })
    return m
  }, [filteredUsers, parentMap])

  // 마을별 user 매핑 (subtree 합 — d2 직속 + 그 d3들의 user)
  const usersByVillage = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      const id = findVillageId(u.community.id)
      if (id == null) return
      if (!m.has(id)) m.set(id, [])
      m.get(id)!.push(u)
    })
    return m
  }, [filteredUsers, parentMap])

  // 다락방별 user 매핑 (d3 직속 user)
  const usersByDarak = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      const id = findDarakId(u.community.id)
      if (id == null) return
      if (!m.has(id)) m.set(id, [])
      m.get(id)!.push(u)
    })
    return m
  }, [filteredUsers, parentMap])

  // 컬럼 1: 담당(d1)
  const dangsCol = useMemo(() => {
    return communities.filter((c) => !c.parent).sort((a, b) => a.id - b.id)
  }, [communities])

  // 사역팀처럼 평탄한 d1: focusedDang에 직속 매달린 user들
  const directUsersOfDang = useMemo(() => {
    if (!focusedDangId) return []
    return [...filteredUsers]
      .filter((u) => u.community?.id === focusedDangId)
      .sort((a, b) => {
        const aLead =
          a.community?.leader?.id === a.id
            ? -2
            : a.community?.deputyLeader?.id === a.id
              ? -1
              : 0
        const bLead =
          b.community?.leader?.id === b.id
            ? -2
            : b.community?.deputyLeader?.id === b.id
              ? -1
              : 0
        if (aLead !== bLead) return aLead - bLead
        return (a.name || "").localeCompare(b.name || "")
      })
  }, [filteredUsers, focusedDangId])

  // 컬럼 2: 선택된 담당의 직계 자식 (= 마을)
  const villagesCol = useMemo(() => {
    if (!focusedDangId) return []
    return communities
      .filter((c) => c.parent?.id === focusedDangId)
      .sort((a, b) => a.id - b.id)
  }, [communities, focusedDangId])

  // 컬럼 3: 선택된 마을의 직계 자식 (= 다락방)
  const daraksCol = useMemo(() => {
    if (!focusedVillageId) return []
    return communities
      .filter((c) => c.parent?.id === focusedVillageId)
      .sort((a, b) => a.id - b.id)
  }, [communities, focusedVillageId])

  // 평탄 모드 여부 (사역팀처럼 마을 단계가 없는 담당이 선택됨)
  const isFlatDangMode =
    focusedDangId != null &&
    villagesCol.length === 0 &&
    directUsersOfDang.length > 0

  // 컬럼 4: 선택된 다락방의 순원들
  const soonwonsCol = useMemo(() => {
    if (!focusedDarakId) return []
    const users = usersByDarak.get(focusedDarakId) || []
    return [...users].sort((a, b) => {
      const aLead =
        a.community?.leader?.id === a.id
          ? -2
          : a.community?.deputyLeader?.id === a.id
            ? -1
            : 0
      const bLead =
        b.community?.leader?.id === b.id
          ? -2
          : b.community?.deputyLeader?.id === b.id
            ? -1
            : 0
      if (aLead !== bLead) return aLead - bLead
      return (a.name || "").localeCompare(b.name || "")
    })
  }, [usersByDarak, focusedDarakId])

  // 검색용 평면 리스트
  const searchResultUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aDang = a.community ? findDangId(a.community.id) : 0
      const bDang = b.community ? findDangId(b.community.id) : 0
      if (aDang !== bDang) return aDang - bDang
      const aVid = a.community ? (findVillageId(a.community.id) ?? 0) : 0
      const bVid = b.community ? (findVillageId(b.community.id) ?? 0) : 0
      if (aVid !== bVid) return aVid - bVid
      const aDid = a.community ? (findDarakId(a.community.id) ?? 0) : 0
      const bDid = b.community ? (findDarakId(b.community.id) ?? 0) : 0
      if (aDid !== bDid) return aDid - bDid
      return (a.name || "").localeCompare(b.name || "")
    })
  }, [filteredUsers, parentMap])

  // 필터 변경으로 포커스 그룹이 비었으면 자동 해제
  useEffect(() => {
    if (
      focusedDangId &&
      (usersByDang.get(focusedDangId)?.length ?? 0) === 0
    ) {
      setFocusedDangId(null)
      setFocusedVillageId(null)
      setFocusedDarakId(null)
    } else if (
      focusedVillageId &&
      (usersByVillage.get(focusedVillageId)?.length ?? 0) === 0
    ) {
      setFocusedVillageId(null)
      setFocusedDarakId(null)
    } else if (
      focusedDarakId &&
      (usersByDarak.get(focusedDarakId)?.length ?? 0) === 0
    ) {
      setFocusedDarakId(null)
    }
  }, [usersByDang, usersByVillage, usersByDarak])

  // 필터 chip 카운트
  const counts = useMemo(() => {
    const base = searchText
      ? allUsers.filter((u) => (u.name || "").includes(searchText))
      : allUsers
    const c = { all: base.length, unrecorded: 0, ATTEND: 0, ABSENT: 0, ETC: 0 }
    base.forEach((u) => {
      const s = getUserStatus(u.id)
      if (s === "unrecorded") c.unrecorded++
      else (c as any)[s]++
    })
    return c
  }, [allUsers, attendMap, searchText])

  function toggleUser(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getGroupState(users: User[]): "none" | "some" | "all" {
    if (users.length === 0) return "none"
    const n = users.filter((u) => checkedIds.has(u.id)).length
    if (n === 0) return "none"
    if (n === users.length) return "all"
    return "some"
  }

  function toggleGroup(users: User[]) {
    const state = getGroupState(users)
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (state === "all") {
        users.forEach((u) => next.delete(u.id))
      } else {
        users.forEach((u) => next.add(u.id))
      }
      return next
    })
  }

  function handleBulkSave(status: AttendStatus) {
    if (!selectedScheduleId) return
    if (checkedIds.size === 0) return

    if (status === AttendStatus.ABSENT || status === AttendStatus.ETC) {
      setMemoDialog({ status, memo: "" })
      return
    }
    runBulkSave(status, "")
  }

  async function runBulkSave(status: AttendStatus, memo: string) {
    if (!selectedScheduleId) return
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return

    const previousStates = new Map<
      string,
      { status: StatusFilter; memo: string }
    >()
    ids.forEach((userId) => {
      previousStates.set(userId, {
        status: getUserStatus(userId),
        memo: attendMap.get(userId)?.memo || "",
      })
    })

    setSaving(true)
    let successfulIds: string[] = []
    let firstFailureMessage = ""
    try {
      const response = await axios.post<BulkAttendanceResponse>(
        "/admin/soon/update-attendance-bulk",
        {
          worshipScheduleId: selectedScheduleId,
          items: ids.map((userId) => ({ userId, isAttend: status, memo })),
        },
      )
      successfulIds = response.data.results
        .filter((r) => r.status === "ok")
        .map((r) => r.userId)
      const firstFail = response.data.results.find((r) => r.status !== "ok")
      if (firstFail) {
        firstFailureMessage = toBulkResultMessage(firstFail)
      }
    } catch (e) {
      firstFailureMessage = toAttendanceErrorMessage(e)
    }

    setAttendData((prev) => {
      const map = new Map(prev.map((d) => [d.user.id, d]))
      successfulIds.forEach((userId) => {
        const existing = map.get(userId)
        if (existing) {
          map.set(userId, { ...existing, isAttend: status, memo })
        } else {
          map.set(userId, {
            id: "local-" + userId,
            user: { id: userId } as User,
            worshipSchedule: {
              id: Number(selectedScheduleId),
            } as WorshipSchedule,
            isAttend: status,
            memo,
          } as AttendData)
        }
      })
      return Array.from(map.values())
    })

    setSaving(false)
    const failed = ids.length - successfulIds.length
    if (failed > 0) {
      error(
        firstFailureMessage
          ? `${failed}건 저장 실패 — ${firstFailureMessage}`
          : `${failed}건 저장 실패`,
      )
    }

    if (successfulIds.length > 0) {
      const snapshot = new Map<
        string,
        { status: StatusFilter; memo: string }
      >()
      successfulIds.forEach((id) => {
        const prev = previousStates.get(id)
        if (prev) snapshot.set(id, prev)
      })
      setUndoAction({
        userIds: successfulIds,
        previousStates: snapshot,
        newStatus: status,
        scheduleId: Number(selectedScheduleId),
      })
    }
    setCheckedIds(new Set())
  }

  async function handleUndo() {
    if (!undoAction) return
    const action = undoAction
    setUndoAction(null)

    const restorable = action.userIds.filter(
      (id) => action.previousStates.get(id)?.status !== "unrecorded",
    )
    const unrecoverable = action.userIds.length - restorable.length

    if (restorable.length === 0) {
      error("이전 상태가 '기록안됨'이라 복구할 수 없습니다")
      return
    }

    let successIds: string[] = []
    try {
      const response = await axios.post<BulkAttendanceResponse>(
        "/admin/soon/update-attendance-bulk",
        {
          worshipScheduleId: action.scheduleId,
          items: restorable.map((userId) => {
            const prev = action.previousStates.get(userId)!
            return { userId, isAttend: prev.status, memo: prev.memo }
          }),
        },
      )
      successIds = response.data.results
        .filter((r) => r.status === "ok")
        .map((r) => r.userId)
    } catch {
      // ignore
    }

    setAttendData((prev) => {
      const map = new Map(prev.map((d) => [d.user.id, d]))
      successIds.forEach((userId) => {
        const target = action.previousStates.get(userId)!
        const existing = map.get(userId)
        if (existing) {
          map.set(userId, {
            ...existing,
            isAttend: target.status as AttendStatus,
            memo: target.memo,
          })
        }
      })
      return Array.from(map.values())
    })

    let msg = `${successIds.length}명 복구됨`
    if (unrecoverable > 0) msg += ` (${unrecoverable}명은 복구 불가)`
    success(msg)
  }

  function statusChip(status: StatusFilter, memo?: string) {
    const base = {
      fontWeight: 600,
      maxWidth: { xs: 140, sm: 200, md: 260 },
      "& .MuiChip-label": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }
    if (status === "ATTEND")
      return (
        <Chip
          size="small"
          label="출석"
          title="출석"
          sx={{ ...base, bgcolor: "rgb(184, 248, 93)" }}
        />
      )
    if (status === "ABSENT") {
      const full = memo ? `결석 · ${memo}` : "결석"
      return (
        <Chip
          size="small"
          label={full}
          title={full}
          sx={{ ...base, bgcolor: "rgb(240, 148, 128)" }}
        />
      )
    }
    if (status === "ETC") {
      const full = memo ? `기타 · ${memo}` : "기타"
      return (
        <Chip
          size="small"
          label={full}
          title={full}
          sx={{ ...base, bgcolor: "rgb(253, 241, 113)" }}
        />
      )
    }
    return null
  }

  const hiddenSelectedCount = useMemo(() => {
    const visible = new Set(filteredUsers.map((u) => u.id))
    let count = 0
    checkedIds.forEach((id) => {
      if (!visible.has(id)) count++
    })
    return count
  }, [filteredUsers, checkedIds])

  // 4단 → 3컬럼 윈도우. focusedDarakId 있으면 [마을, 다락방, 순원], 아니면 [담당, 마을, 다락방].
  const showSoonwonMode = focusedDarakId != null

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: 2,
        pb: "calc(96px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 48,
          zIndex: 5,
          bgcolor: "#f5f5f5",
          mx: -2,
          px: 2,
          pt: 2,
          pb: 0.5,
          mb: 1,
          boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)",
        }}
      >
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            select
            SelectProps={{ native: true }}
            value={selectedScheduleId}
            label="예배"
            fullWidth
            size="small"
            onChange={(e) =>
              setSelectedScheduleId(Number(e.target.value) || "")
            }
            InputLabelProps={{ shrink: true }}
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} · {worshipKr(s.kind)}
              </option>
            ))}
          </TextField>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            상태별 필터
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              overflowX: "auto",
              overflowY: "hidden",
              "& > *": { flexShrink: 0 },
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              WebkitMaskImage:
                "linear-gradient(to right, black calc(100% - 24px), transparent)",
              maskImage:
                "linear-gradient(to right, black calc(100% - 24px), transparent)",
              pr: 3,
              pb: 0.5,
            }}
          >
            {(
              [
                { k: "all", label: "전체", count: counts.all },
                { k: "unrecorded", label: "기록안됨", count: counts.unrecorded },
                { k: "ATTEND", label: "출석", count: counts.ATTEND },
                { k: "ABSENT", label: "결석", count: counts.ABSENT },
                { k: "ETC", label: "기타", count: counts.ETC },
              ] as { k: StatusFilter; label: string; count: number }[]
            ).map(({ k, label, count }) => (
              <Chip
                key={k}
                label={`${label} · ${count}`}
                color={statusFilter === k ? "primary" : "default"}
                variant={statusFilter === k ? "filled" : "outlined"}
                onClick={() => setStatusFilter(k)}
                disabled={k !== "all" && count === 0}
              />
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="이름 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ borderBottom: "1px solid #e0e0e0", pb: 1, mb: 1 }}
        >
          <Checkbox
            checked={
              filteredUsers.length > 0 &&
              filteredUsers.every((u) => checkedIds.has(u.id))
            }
            indeterminate={
              filteredUsers.some((u) => checkedIds.has(u.id)) &&
              !filteredUsers.every((u) => checkedIds.has(u.id))
            }
            onChange={() => toggleGroup(filteredUsers)}
            disabled={filteredUsers.length === 0}
          />
          <Typography fontWeight="bold">
            전체 선택 (표시 중 {filteredUsers.length}명)
          </Typography>
        </Stack>

        {searchText ? (
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              overflow: "hidden",
              minHeight: 440,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                검색 결과 ({searchResultUsers.length}명)
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto", maxHeight: 520 }}>
              {searchResultUsers.length === 0 ? (
                <EmptyState>검색 결과가 없습니다</EmptyState>
              ) : (
                searchResultUsers.map((u) => {
                  const status = getUserStatus(u.id)
                  const memo = attendMap.get(u.id)?.memo
                  const isLeader = u.community?.leader?.id === u.id
                  const isDeputy = u.community?.deputyLeader?.id === u.id
                  const checked = checkedIds.has(u.id)
                  const dangId = u.community
                    ? findDangId(u.community.id)
                    : null
                  const villageId = u.community
                    ? findVillageId(u.community.id)
                    : null
                  const darakId = u.community
                    ? findDarakId(u.community.id)
                    : null
                  const dangName = dangId ? nameMap.get(dangId) : ""
                  const villageName = villageId ? nameMap.get(villageId) : ""
                  const darakName = darakId ? nameMap.get(darakId) : ""
                  const path = [dangName, villageName, darakName]
                    .filter(Boolean)
                    .join(" › ")
                  return (
                    <RowButton
                      key={u.id}
                      focused={checked}
                      onClick={() => toggleUser(u.id)}
                    >
                      <Checkbox
                        size="small"
                        checked={checked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleUser(u.id)}
                      />
                      <Stack flex={1} overflow="hidden">
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Typography noWrap fontWeight={500}>
                            {u.name}
                          </Typography>
                          {(isLeader || isDeputy) && (
                            <Chip
                              size="small"
                              label={isLeader ? "순장" : "부순장"}
                              sx={{
                                height: 18,
                                fontSize: 10,
                                bgcolor: isLeader ? "#e3f2fd" : "#f3e5f5",
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {path} · {u.yearOfBirth}년생 ·{" "}
                          {u.gender === "man" ? "남" : "여"}
                        </Typography>
                      </Stack>
                      <Box>{statusChip(status, memo)}</Box>
                    </RowButton>
                  )
                })
              )}
            </Box>
          </Box>
        ) : (
          <>
            {/* 모드 표시 + 뒤로가기 */}
            {showSoonwonMode && (
              <Stack
                direction="row"
                alignItems="center"
                sx={{ mb: 1, pl: 0.5 }}
              >
                <IconButton
                  size="small"
                  onClick={() => setFocusedDarakId(null)}
                  title="담당으로 돌아가기"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {focusedDangId && nameMap.get(focusedDangId)} ›{" "}
                  {focusedVillageId && nameMap.get(focusedVillageId)} ›{" "}
                  {focusedDarakId && nameMap.get(focusedDarakId)}
                </Typography>
              </Stack>
            )}
            {!showSoonwonMode && focusedDangId != null && (
              <Stack
                direction="row"
                alignItems="center"
                sx={{ mb: 1, pl: 0.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {nameMap.get(focusedDangId)}
                  {focusedVillageId &&
                    ` › ${nameMap.get(focusedVillageId)}`}
                </Typography>
              </Stack>
            )}

            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={1.5}
              sx={{ minHeight: 440 }}
            >
              {showSoonwonMode ? (
                <>
                  {/* 모드 B: [마을, 다락방, 순원] */}
                  <ColumnBox title="마을" flex={1}>
                    {villagesCol.map((v) => {
                      const users = usersByVillage.get(v.id) || []
                      const count = users.length
                      const state = getGroupState(users)
                      const isFocused = focusedVillageId === v.id
                      return (
                        <RowButton
                          key={v.id}
                          focused={isFocused}
                          onClick={() => {
                            setFocusedVillageId(v.id)
                            setFocusedDarakId(null)
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={state === "all"}
                            indeterminate={state === "some"}
                            disabled={count === 0}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleGroup(users)}
                          />
                          <Stack flex={1} overflow="hidden">
                            <Typography
                              noWrap
                              fontWeight={isFocused ? 700 : 500}
                            >
                              {v.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {count}명
                            </Typography>
                          </Stack>
                          <ChevronRightIcon fontSize="small" color="disabled" />
                        </RowButton>
                      )
                    })}
                  </ColumnBox>

                  <ColumnBox title="다락방" flex={1}>
                    {daraksCol.length === 0 ? (
                      <EmptyState>하위 다락방 없음</EmptyState>
                    ) : (
                      daraksCol.map((d) => {
                        const users = usersByDarak.get(d.id) || []
                        const count = users.length
                        const state = getGroupState(users)
                        const isFocused = focusedDarakId === d.id
                        return (
                          <RowButton
                            key={d.id}
                            focused={isFocused}
                            onClick={() => setFocusedDarakId(d.id)}
                          >
                            <Checkbox
                              size="small"
                              checked={state === "all"}
                              indeterminate={state === "some"}
                              disabled={count === 0}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleGroup(users)}
                            />
                            <Stack flex={1} overflow="hidden">
                              <Typography
                                noWrap
                                fontWeight={isFocused ? 700 : 500}
                              >
                                {d.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {count}명
                              </Typography>
                            </Stack>
                            <ChevronRightIcon
                              fontSize="small"
                              color="disabled"
                            />
                          </RowButton>
                        )
                      })
                    )}
                  </ColumnBox>

                  <ColumnBox title="순원" flex={1.4}>
                    {soonwonsCol.length === 0 ? (
                      <EmptyState>순원 없음</EmptyState>
                    ) : (
                      soonwonsCol.map((u) => {
                        const status = getUserStatus(u.id)
                        const memo = attendMap.get(u.id)?.memo
                        const isLeader = u.community?.leader?.id === u.id
                        const isDeputy =
                          u.community?.deputyLeader?.id === u.id
                        const checked = checkedIds.has(u.id)
                        return (
                          <RowButton
                            key={u.id}
                            focused={checked}
                            onClick={() => toggleUser(u.id)}
                          >
                            <Checkbox
                              size="small"
                              checked={checked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleUser(u.id)}
                            />
                            <Stack flex={1} overflow="hidden">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Typography noWrap>{u.name}</Typography>
                                {(isLeader || isDeputy) && (
                                  <Chip
                                    size="small"
                                    label={isLeader ? "순장" : "부순장"}
                                    sx={{
                                      height: 18,
                                      fontSize: 10,
                                      bgcolor: isLeader
                                        ? "#e3f2fd"
                                        : "#f3e5f5",
                                    }}
                                  />
                                )}
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {u.yearOfBirth}년생 ·{" "}
                                {u.gender === "man" ? "남" : "여"}
                              </Typography>
                            </Stack>
                            <Box>{statusChip(status, memo)}</Box>
                          </RowButton>
                        )
                      })
                    )}
                  </ColumnBox>
                </>
              ) : (
                <>
                  {/* 모드 A: [담당, 마을, 다락방] */}
                  <ColumnBox title="담당" flex={1}>
                    {dangsCol.map((dang) => {
                      const users = usersByDang.get(dang.id) || []
                      const count = users.length
                      const state = getGroupState(users)
                      const isFocused = focusedDangId === dang.id
                      return (
                        <RowButton
                          key={dang.id}
                          focused={isFocused}
                          onClick={() => {
                            setFocusedDangId(dang.id)
                            setFocusedVillageId(null)
                            setFocusedDarakId(null)
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={state === "all"}
                            indeterminate={state === "some"}
                            disabled={count === 0}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleGroup(users)}
                          />
                          <Stack flex={1} overflow="hidden">
                            <Typography
                              noWrap
                              fontWeight={isFocused ? 700 : 500}
                            >
                              {dang.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {count}명
                            </Typography>
                          </Stack>
                          <ChevronRightIcon fontSize="small" color="disabled" />
                        </RowButton>
                      )
                    })}
                  </ColumnBox>

                  <ColumnBox title="마을" flex={1}>
                    {!focusedDangId ? (
                      <EmptyState>담당을 선택하세요</EmptyState>
                    ) : villagesCol.length === 0 ? (
                      <EmptyState>하위 마을 없음</EmptyState>
                    ) : (
                      villagesCol.map((v) => {
                        const users = usersByVillage.get(v.id) || []
                        const count = users.length
                        const state = getGroupState(users)
                        const isFocused = focusedVillageId === v.id
                        return (
                          <RowButton
                            key={v.id}
                            focused={isFocused}
                            onClick={() => {
                              setFocusedVillageId(v.id)
                              setFocusedDarakId(null)
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={state === "all"}
                              indeterminate={state === "some"}
                              disabled={count === 0}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleGroup(users)}
                            />
                            <Stack flex={1} overflow="hidden">
                              <Typography
                                noWrap
                                fontWeight={isFocused ? 700 : 500}
                              >
                                {v.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {count}명
                              </Typography>
                            </Stack>
                            <ChevronRightIcon
                              fontSize="small"
                              color="disabled"
                            />
                          </RowButton>
                        )
                      })
                    )}
                  </ColumnBox>

                  <ColumnBox
                    title={isFlatDangMode ? "순원" : "다락방"}
                    flex={isFlatDangMode ? 1.4 : 1}
                  >
                    {isFlatDangMode ? (
                      // 사역팀처럼 평탄한 담당: 다락방 자리에 user 직접
                      directUsersOfDang.map((u) => {
                        const status = getUserStatus(u.id)
                        const memo = attendMap.get(u.id)?.memo
                        const isLeader = u.community?.leader?.id === u.id
                        const isDeputy =
                          u.community?.deputyLeader?.id === u.id
                        const checked = checkedIds.has(u.id)
                        return (
                          <RowButton
                            key={u.id}
                            focused={checked}
                            onClick={() => toggleUser(u.id)}
                          >
                            <Checkbox
                              size="small"
                              checked={checked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleUser(u.id)}
                            />
                            <Stack flex={1} overflow="hidden">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Typography noWrap>{u.name}</Typography>
                                {(isLeader || isDeputy) && (
                                  <Chip
                                    size="small"
                                    label={isLeader ? "순장" : "부순장"}
                                    sx={{
                                      height: 18,
                                      fontSize: 10,
                                      bgcolor: isLeader
                                        ? "#e3f2fd"
                                        : "#f3e5f5",
                                    }}
                                  />
                                )}
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {u.yearOfBirth}년생 ·{" "}
                                {u.gender === "man" ? "남" : "여"}
                              </Typography>
                            </Stack>
                            <Box>{statusChip(status, memo)}</Box>
                          </RowButton>
                        )
                      })
                    ) : !focusedVillageId ? (
                      <EmptyState>마을을 선택하세요</EmptyState>
                    ) : daraksCol.length === 0 ? (
                      <EmptyState>하위 다락방 없음</EmptyState>
                    ) : (
                      daraksCol.map((d) => {
                        const users = usersByDarak.get(d.id) || []
                        const count = users.length
                        const state = getGroupState(users)
                        const isFocused = focusedDarakId === d.id
                        return (
                          <RowButton
                            key={d.id}
                            focused={isFocused}
                            onClick={() => setFocusedDarakId(d.id)}
                          >
                            <Checkbox
                              size="small"
                              checked={state === "all"}
                              indeterminate={state === "some"}
                              disabled={count === 0}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleGroup(users)}
                            />
                            <Stack flex={1} overflow="hidden">
                              <Typography
                                noWrap
                                fontWeight={isFocused ? 700 : 500}
                              >
                                {d.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {count}명
                              </Typography>
                            </Stack>
                            <ChevronRightIcon
                              fontSize="small"
                              color="disabled"
                            />
                          </RowButton>
                        )
                      })
                    )}
                  </ColumnBox>
                </>
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* 공통 사유 다이얼로그 */}
      <Dialog
        open={Boolean(memoDialog)}
        onClose={() => setMemoDialog(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {memoDialog?.status === AttendStatus.ABSENT ? "결석" : "기타"} 사유
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {checkedIds.size}명에게 공통으로 적용할 사유 (비워두면 각자 빈칸)
          </Typography>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            placeholder="예: 가족 행사, 시험 준비 등"
            value={memoDialog?.memo ?? ""}
            onChange={(e) =>
              memoDialog &&
              setMemoDialog({ ...memoDialog, memo: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && memoDialog) {
                const { status, memo } = memoDialog
                setMemoDialog(null)
                runBulkSave(status, memo)
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemoDialog(null)}>취소</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!memoDialog) return
              const { status, memo } = memoDialog
              setMemoDialog(null)
              runBulkSave(status, memo)
            }}
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(undoAction)}
        autoHideDuration={10000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return
          setUndoAction(null)
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          mb:
            checkedIds.size > 0
              ? "calc(80px + env(safe-area-inset-bottom, 0px))"
              : "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
        message={
          undoAction
            ? `${undoAction.userIds.length}명에게 '${statusLabel(
                undoAction.newStatus,
              )}' 적용됨`
            : ""
        }
        action={
          <Button color="inherit" size="small" onClick={handleUndo}>
            실행 취소
          </Button>
        }
      />

      {checkedIds.size > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            pt: 1.5,
            px: 1.5,
            pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
            zIndex: 100,
            borderTop: "2px solid #1976d2",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography fontWeight="bold">
                ✓ {checkedIds.size}명 선택
              </Typography>
              {hiddenSelectedCount > 0 && (
                <Typography color="warning.main" variant="caption">
                  (화면 밖 {hiddenSelectedCount}명 포함)
                </Typography>
              )}
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                startIcon={isNarrow ? undefined : <CheckCircleIcon />}
                onClick={() => handleBulkSave(AttendStatus.ATTEND)}
                disabled={saving}
                size="small"
                title="출석"
                sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2 } }}
              >
                {isNarrow ? <CheckCircleIcon fontSize="small" /> : "출석"}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={isNarrow ? undefined : <CancelIcon />}
                onClick={() => handleBulkSave(AttendStatus.ABSENT)}
                disabled={saving}
                size="small"
                title="결석"
                sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2 } }}
              >
                {isNarrow ? <CancelIcon fontSize="small" /> : "결석"}
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={isNarrow ? undefined : <HelpIcon />}
                onClick={() => handleBulkSave(AttendStatus.ETC)}
                disabled={saving}
                size="small"
                title="기타"
                sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2 } }}
              >
                {isNarrow ? <HelpIcon fontSize="small" /> : "기타"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCheckedIds(new Set())}
                disabled={saving}
                size="small"
                title="선택 해제"
                sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2 } }}
              >
                {isNarrow ? <CloseIcon fontSize="small" /> : "해제"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

function statusLabel(status: AttendStatus) {
  if (status === AttendStatus.ATTEND) return "출석"
  if (status === AttendStatus.ABSENT) return "결석"
  return "기타"
}

function ColumnBox({
  title,
  flex,
  children,
}: {
  title: string
  flex: number
  children: React.ReactNode
}) {
  return (
    <Box
      flex={flex}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", maxHeight: 520 }}>{children}</Box>
    </Box>
  )
}

function RowButton({
  focused,
  onClick,
  children,
}: {
  focused?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      onClick={onClick}
      sx={{
        px: 1,
        py: 0.5,
        borderBottom: "1px solid #eee",
        bgcolor: focused ? "#e3f2fd" : "transparent",
        cursor: "pointer",
        "&:hover": {
          bgcolor: focused ? "#bbdefb" : "#f0f7fc",
        },
      }}
    >
      {children}
    </Stack>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Box p={3} textAlign="center" color="text.secondary">
      <Typography variant="body2">{children}</Typography>
    </Box>
  )
}

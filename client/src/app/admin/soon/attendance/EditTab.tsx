"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

  // Phase 3: 공통 사유 다이얼로그
  const [memoDialog, setMemoDialog] = useState<{
    status: AttendStatus
    memo: string
  } | null>(null)

  const { success, error } = useNotification()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  // bulk 버튼 라벨 숨김 기준 — 600px 미만에선 아이콘만
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

  // 전체 유저 로드
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

  // 선택된 예배의 출석 데이터 로드
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

  function findVillageId(darakId: number): number {
    let cur = darakId
    for (let i = 0; i < 10; i++) {
      const parent = parentMap.get(cur)
      if (parent === null || parent === undefined) return cur
      cur = parent
    }
    return cur
  }

  // 필터링된 유저
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const status = getUserStatus(u.id)
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (searchText && !(u.name || "").includes(searchText)) return false
      return true
    })
  }, [allUsers, statusFilter, searchText, attendMap])

  // 마을별 유저 매핑
  const usersByVillage = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      const vid = findVillageId(u.community.id)
      if (!m.has(vid)) m.set(vid, [])
      m.get(vid)!.push(u)
    })
    return m
  }, [filteredUsers, parentMap])

  // 다락방별 유저 매핑
  const usersByDarak = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      if (!m.has(u.community.id)) m.set(u.community.id, [])
      m.get(u.community.id)!.push(u)
    })
    return m
  }, [filteredUsers])

  // 컬럼 1: 최상위 마을들
  const villagesCol = useMemo(() => {
    return communities
      .filter((c) => !c.parent)
      .sort((a, b) => a.id - b.id)
  }, [communities])

  // 컬럼 2: 포커스된 마을의 직계 다락방들
  const daraksCol = useMemo(() => {
    if (!focusedVillageId) return []
    return communities
      .filter((c) => c.parent?.id === focusedVillageId)
      .sort((a, b) => a.id - b.id)
  }, [communities, focusedVillageId])

  // 컬럼 3: 포커스된 다락방의 순원들 (필터링된 것 중)
  const usersCol = useMemo(() => {
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

  // 검색 시 평면 리스트용 (마을 → 다락방 → 이름 순)
  const searchResultUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aVid = a.community ? findVillageId(a.community.id) : 0
      const bVid = b.community ? findVillageId(b.community.id) : 0
      if (aVid !== bVid) return aVid - bVid
      const aDid = a.community?.id || 0
      const bDid = b.community?.id || 0
      if (aDid !== bDid) return aDid - bDid
      return (a.name || "").localeCompare(b.name || "")
    })
  }, [filteredUsers, parentMap])

  // 필터 변경으로 포커스 그룹이 비었을 경우 자동 해제
  useEffect(() => {
    if (
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
  }, [usersByVillage, usersByDarak])

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

  // 선택 헬퍼
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

  // Bulk 저장 진입점 — ABSENT/ETC는 사유 다이얼로그 경유
  function handleBulkSave(status: AttendStatus) {
    if (!selectedScheduleId) return
    if (checkedIds.size === 0) return

    if (status === AttendStatus.ABSENT || status === AttendStatus.ETC) {
      // 공통 사유 다이얼로그 오픈
      setMemoDialog({ status, memo: "" })
      return
    }
    // ATTEND는 다이얼로그 없이 바로
    runBulkSave(status, "")
  }

  async function runBulkSave(status: AttendStatus, memo: string) {
    if (!selectedScheduleId) return
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return

    // Phase 3: 스냅샷 저장 (undo용)
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
    const results = await Promise.allSettled(
      ids.map((userId) =>
        axios.post("/admin/soon/update-attendance", {
          userId,
          worshipScheduleId: selectedScheduleId,
          isAttend: status,
          memo,
        }),
      ),
    )
    const successfulIds: string[] = []
    ids.forEach((id, i) => {
      if (results[i].status === "fulfilled") successfulIds.push(id)
    })

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
      error(`${failed}건 저장 실패`)
    }

    // Phase 3: Undo 액션 준비 (성공한 것만)
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

  // Phase 3: Undo 실행
  async function handleUndo() {
    if (!undoAction) return
    const action = undoAction
    setUndoAction(null) // 스낵바 먼저 닫기

    const restorable = action.userIds.filter(
      (id) => action.previousStates.get(id)?.status !== "unrecorded",
    )
    const unrecoverable = action.userIds.length - restorable.length

    if (restorable.length === 0) {
      error("이전 상태가 '기록안됨'이라 복구할 수 없습니다")
      return
    }

    const results = await Promise.allSettled(
      restorable.map((userId) => {
        const prev = action.previousStates.get(userId)!
        return axios.post("/admin/soon/update-attendance", {
          userId,
          worshipScheduleId: action.scheduleId,
          isAttend: prev.status,
          memo: prev.memo,
        })
      }),
    )
    const successIds = restorable.filter(
      (_, i) => results[i].status === "fulfilled",
    )

    // 로컬 상태 복원
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
    // chip 공통 style — 긴 memo는 말줄임 처리
    const base = {
      fontWeight: 600,
      maxWidth: { xs: 140, sm: 200, md: 260 },
      // MUI Chip 기본 label엔 이미 ellipsis가 걸려있지만, 명시적으로 한 번 더
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
        // bulk bar 공간 + iPhone 홈 인디케이터 영역만큼 여유
        pb: "calc(96px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* 컨트롤 3종을 sticky 래퍼로 묶어 리스트 스크롤 시에도 상단 고정 */}
      <Box
        sx={{
          position: "sticky",
          top: 48, // Tabs 높이만큼 내려옴
          zIndex: 5,
          bgcolor: "#f5f5f5", // 외부 배경과 동일해서 리스트가 비쳐 보이지 않게
          mx: -2, // 외부 p:2 상쇄
          px: 2, // 다시 적용
          pt: 2,
          pb: 0.5,
          mb: 1,
          // 하단에 살짝 그림자 → 스크롤되어 띄워진 상태임을 암시
          boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)",
        }}
      >
      {/* 예배 선택 — 모바일: OS 네이티브 picker (iOS 휠, Android 다이얼로그) */}
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

      {/* 상태 필터 — 모바일 친화적 가로 스크롤 */}
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
            // 각 chip이 줄어들지 않음
            "& > *": { flexShrink: 0 },
            // 스크롤바 숨김 (가독성)
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            // iOS 모멘텀 스크롤
            WebkitOverflowScrolling: "touch",
            // 오른쪽 가장자리 페이드 힌트 (스크롤 가능 암시)
            WebkitMaskImage:
              "linear-gradient(to right, black calc(100% - 24px), transparent)",
            maskImage:
              "linear-gradient(to right, black calc(100% - 24px), transparent)",
            pr: 3, // 페이드 영역 너비만큼 여유
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

      {/* 검색 */}
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
      {/* ↑ sticky 래퍼 종료 */}

      {/* 3-column 리스트 */}
      <Paper sx={{ p: 2 }}>
        {/* 전체 선택 헤더 */}
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
          /* 검색 중: 평면 리스트 */
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
                  const vId = u.community
                    ? findVillageId(u.community.id)
                    : null
                  const vName = vId ? nameMap.get(vId) : ""
                  const dName = u.community
                    ? nameMap.get(u.community.id)
                    : ""
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
                          {vName} › {dName} · {u.yearOfBirth}년생 ·{" "}
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
          {/* 모바일 전용: 뒤로가기 + 경로 */}
          {isMobile && focusedVillageId != null && (
            <Stack direction="row" alignItems="center" sx={{ mb: 1, pl: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => {
                  if (focusedDarakId != null) setFocusedDarakId(null)
                  else setFocusedVillageId(null)
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {nameMap.get(focusedVillageId)}
                {focusedDarakId != null &&
                  ` › ${nameMap.get(focusedDarakId)}`}
              </Typography>
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={1.5}
            sx={{ minHeight: 440 }}
          >
          {/* 컬럼 1: 마을 — 모바일에선 focused 상태일 때 숨김 */}
          {(!isMobile || focusedVillageId == null) && (
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
                    <Typography noWrap fontWeight={isFocused ? 700 : 500}>
                      {v.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {count}명
                    </Typography>
                  </Stack>
                  <ChevronRightIcon fontSize="small" color="disabled" />
                </RowButton>
              )
            })}
          </ColumnBox>

          )}

          {/* 컬럼 2: 다락방 — 모바일에선 마을 선택됐고 다락방 미선택일 때만 */}
          {(!isMobile ||
            (focusedVillageId != null && focusedDarakId == null)) && (
          <ColumnBox title="다락방" flex={1}>
            {!focusedVillageId ? (
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
                      <Typography noWrap fontWeight={isFocused ? 700 : 500}>
                        {d.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {count}명
                      </Typography>
                    </Stack>
                    <ChevronRightIcon fontSize="small" color="disabled" />
                  </RowButton>
                )
              })
            )}
          </ColumnBox>

          )}

          {/* 컬럼 3: 순원 — 모바일에선 다락방 선택됐을 때만 */}
          {(!isMobile || focusedDarakId != null) && (
          <ColumnBox title="순원" flex={1.4}>
            {!focusedDarakId ? (
              <EmptyState>다락방을 선택하세요</EmptyState>
            ) : usersCol.length === 0 ? (
              <EmptyState>해당 조건의 순원 없음</EmptyState>
            ) : (
              usersCol.map((u) => {
                const status = getUserStatus(u.id)
                const memo = attendMap.get(u.id)?.memo
                const isLeader = u.community?.leader?.id === u.id
                const isDeputy = u.community?.deputyLeader?.id === u.id
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
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography noWrap>{u.name}</Typography>
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
                      <Typography variant="caption" color="text.secondary">
                        {u.yearOfBirth}년생 · {u.gender === "man" ? "남" : "여"}
                      </Typography>
                    </Stack>
                    <Box>{statusChip(status, memo)}</Box>
                  </RowButton>
                )
              })
            )}
          </ColumnBox>
          )}
          </Stack>
          </>
        )}
      </Paper>

      {/* Phase 3: 공통 사유 다이얼로그 */}
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

      {/* Phase 3: Undo 스낵바 */}
      <Snackbar
        open={Boolean(undoAction)}
        autoHideDuration={10000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return
          setUndoAction(null)
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          // bulk bar 위로 / 없으면 최소 여백. 모두 safe-area inset 추가
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

      {/* Sticky bulk action bar */}
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
            // 하단 padding에 iPhone 홈 인디케이터 인셋 포함
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

/* --- 하위 컴포넌트 --- */

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

function statusLabel(status: AttendStatus) {
  if (status === AttendStatus.ATTEND) return "출석"
  if (status === AttendStatus.ABSENT) return "결석"
  return "기타"
}

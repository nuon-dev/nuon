"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import { AttendStatus } from "@server/entity/types"
import { User } from "@server/entity/user"

import {
  StatusFilter,
  findVillageId,
  getGroupState,
  getUserAttendStatus,
  sortUsersByLeadership,
  sortUsersByVillagePath,
} from "./utils/attendanceUtils"
import { useAttendanceData } from "./useAttendanceData"
import { useSelection } from "./useSelection"
import { useDrillDownFocus } from "./useDrillDownFocus"
import { useBulkAttendance } from "./useBulkAttendance"
import { ColumnBox, EmptyState } from "./Primitives"
import { ScheduleSelector } from "./ScheduleSelector"
import { StatusFilterBar } from "./StatusFilterBar"
import { SearchInput } from "./SearchInput"
import { UserRow } from "./UserRow"
import { VillageRow } from "./VillageRow"
import { DarakRow } from "./DarakRow"
import { MemoDialog, MemoDialogState } from "./MemoDialog"
import { UndoSnackbar } from "./UndoSnackbar"
import { BulkActionBar } from "./BulkActionBar"

export default function EditTab() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | "">("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchText, setSearchText] = useState("")
  const [memoDialog, setMemoDialog] = useState<MemoDialogState | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const {
    communities,
    allUsers,
    schedules,
    attendMap,
    parentMap,
    nameMap,
    loading,
    setAttendData,
  } = useAttendanceData(selectedScheduleId)

  // 첫 schedule 자동 선택
  useEffect(() => {
    if (selectedScheduleId === "" && schedules.length > 0) {
      setSelectedScheduleId(schedules[0].id)
    }
  }, [schedules])

  const {
    checkedIds,
    toggleUser,
    toggleGroup,
    clear: clearSelection,
  } = useSelection()

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const status = getUserAttendStatus(attendMap, u.id)
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (searchText && !(u.name || "").includes(searchText)) return false
      return true
    })
  }, [allUsers, statusFilter, searchText, attendMap])

  const usersByVillage = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      const vid = findVillageId(parentMap, u.community.id)
      if (!m.has(vid)) m.set(vid, [])
      m.get(vid)!.push(u)
    })
    return m
  }, [filteredUsers, parentMap])

  const usersByDarak = useMemo(() => {
    const m = new Map<number, User[]>()
    filteredUsers.forEach((u) => {
      if (!u.community) return
      if (!m.has(u.community.id)) m.set(u.community.id, [])
      m.get(u.community.id)!.push(u)
    })
    return m
  }, [filteredUsers])

  const {
    focusedVillageId,
    focusedDarakId,
    focusVillage,
    focusDarak,
    back: focusBack,
  } = useDrillDownFocus({ usersByVillage, usersByDarak })

  const villagesCol = useMemo(
    () => communities.filter((c) => !c.parent).sort((a, b) => a.id - b.id),
    [communities],
  )

  const daraksCol = useMemo(() => {
    if (!focusedVillageId) return []
    return communities
      .filter((c) => c.parent?.id === focusedVillageId)
      .sort((a, b) => a.id - b.id)
  }, [communities, focusedVillageId])

  const usersCol = useMemo(() => {
    if (!focusedDarakId) return []
    return sortUsersByLeadership(usersByDarak.get(focusedDarakId) || [])
  }, [usersByDarak, focusedDarakId])

  const searchResultUsers = useMemo(
    () => sortUsersByVillagePath(filteredUsers, parentMap),
    [filteredUsers, parentMap],
  )

  const counts = useMemo(() => {
    const base = searchText
      ? allUsers.filter((u) => (u.name || "").includes(searchText))
      : allUsers
    const c = { all: base.length, unrecorded: 0, ATTEND: 0, ABSENT: 0, ETC: 0 }
    base.forEach((u) => {
      const s = getUserAttendStatus(attendMap, u.id)
      if (s === "unrecorded") c.unrecorded++
      else (c as any)[s]++
    })
    return c
  }, [allUsers, attendMap, searchText])

  const { saving, undoAction, runBulkSave, handleUndo, dismissUndo } =
    useBulkAttendance({
      scheduleId: selectedScheduleId,
      attendMap,
      setAttendData,
    })

  function handleBulkSave(status: AttendStatus) {
    if (!selectedScheduleId) return
    if (checkedIds.size === 0) return
    if (status === AttendStatus.ABSENT || status === AttendStatus.ETC) {
      setMemoDialog({ status, memo: "" })
      return
    }
    void runBulkSave(checkedIds, status, "").then(clearSelection)
  }

  function applyMemoDialog() {
    if (!memoDialog) return
    const { status, memo } = memoDialog
    setMemoDialog(null)
    void runBulkSave(checkedIds, status, memo).then(clearSelection)
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
        // bulk bar 공간 + iPhone 홈 인디케이터
        pb: "calc(96px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* sticky 컨트롤 — 리스트 스크롤 시에도 상단 고정 */}
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
        <ScheduleSelector
          schedules={schedules}
          value={selectedScheduleId}
          onChange={setSelectedScheduleId}
        />
        <StatusFilterBar
          counts={counts}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <SearchInput value={searchText} onChange={setSearchText} />
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
                  const vId = u.community
                    ? findVillageId(parentMap, u.community.id)
                    : null
                  return (
                    <UserRow
                      key={u.id}
                      user={u}
                      status={getUserAttendStatus(attendMap, u.id)}
                      memo={attendMap.get(u.id)?.memo}
                      checked={checkedIds.has(u.id)}
                      onToggle={toggleUser}
                      vName={vId ? nameMap.get(vId) : undefined}
                      dName={u.community ? nameMap.get(u.community.id) : undefined}
                    />
                  )
                })
              )}
            </Box>
          </Box>
        ) : (
          <>
            {isMobile && focusedVillageId != null && (
              <Stack
                direction="row"
                alignItems="center"
                sx={{ mb: 1, pl: 0.5 }}
              >
                <IconButton size="small" onClick={focusBack}>
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
              {(!isMobile || focusedVillageId == null) && (
                <ColumnBox title="마을" flex={1}>
                  {villagesCol.map((v) => {
                    const users = usersByVillage.get(v.id) || []
                    return (
                      <VillageRow
                        key={v.id}
                        village={v}
                        users={users}
                        groupState={getGroupState(checkedIds, users)}
                        isFocused={focusedVillageId === v.id}
                        onFocus={focusVillage}
                        onToggleGroup={toggleGroup}
                      />
                    )
                  })}
                </ColumnBox>
              )}

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
                      return (
                        <DarakRow
                          key={d.id}
                          darak={d}
                          users={users}
                          groupState={getGroupState(checkedIds, users)}
                          isFocused={focusedDarakId === d.id}
                          onFocus={focusDarak}
                          onToggleGroup={toggleGroup}
                        />
                      )
                    })
                  )}
                </ColumnBox>
              )}

              {(!isMobile || focusedDarakId != null) && (
                <ColumnBox title="순원" flex={1.4}>
                  {!focusedDarakId ? (
                    <EmptyState>다락방을 선택하세요</EmptyState>
                  ) : usersCol.length === 0 ? (
                    <EmptyState>해당 조건의 순원 없음</EmptyState>
                  ) : (
                    usersCol.map((u) => (
                      <UserRow
                        key={u.id}
                        user={u}
                        status={getUserAttendStatus(attendMap, u.id)}
                        memo={attendMap.get(u.id)?.memo}
                        checked={checkedIds.has(u.id)}
                        onToggle={toggleUser}
                      />
                    ))
                  )}
                </ColumnBox>
              )}
            </Stack>
          </>
        )}
      </Paper>

      <MemoDialog
        state={memoDialog}
        selectedCount={checkedIds.size}
        onChange={setMemoDialog}
        onApply={applyMemoDialog}
      />

      <UndoSnackbar
        action={undoAction}
        bulkBarVisible={checkedIds.size > 0}
        onUndo={handleUndo}
        onDismiss={dismissUndo}
      />

      <BulkActionBar
        selectedCount={checkedIds.size}
        hiddenSelectedCount={hiddenSelectedCount}
        saving={saving}
        onSave={handleBulkSave}
        onClear={clearSelection}
      />
    </Box>
  )
}

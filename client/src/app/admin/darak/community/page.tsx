"use client"

import { useSetAtom } from "jotai"
import styles from "./page.module.css"
import { Stack, Box } from "@mui/material"
import CommunityCard from "./CommunityCard"
import { dele, get, post, put } from "@/config/api"
import { MouseEvent, useEffect, useState } from "react"
import { type Community } from "@server/entity/community"
import { NotificationMessage } from "@/state/notification"
import CommunityControlPanel from "./CommunityControlPanel"

enum EditMode {
  All,
  Folder,
}

export default function CommunityComponent() {
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<
    Community | undefined
  >(undefined)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState<EditMode>(EditMode.All)
  const [communityStack, setCommunityStack] = useState<Community[]>([])

  const [clickedCommunity, setClickedCommunity] = useState<
    Community | undefined
  >()
  const [isCommunityNameEditMode, setIsCommunityNameEditMode] = useState(false)
  const [clickedCommunityName, setClickedCommunityName] = useState("")
  const [isMoveMode, setIsMoveMode] = useState(false)

  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    fetchData()
    addEventListener("mousemove", mousemoveListener)
    return () => removeEventListener("mousemove", mousemoveListener)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isCommunityNameEditMode && clickedCommunity) {
        await saveCommunity({ ...clickedCommunity, name: clickedCommunityName })
        setClickedCommunity(undefined)
        fetchData()
      }
    })()
  }, [isCommunityNameEditMode])

  function mousemoveListener(e: any) {
    const event = e as MouseEvent
    setMousePosition({ x: event.pageX, y: event.pageY })
    setIsMoveMode(true)
  }

  async function fetchData() {
    const data = await get("/admin/community")
    setCommunityList(data)
  }

  function selectCommunity(e: MouseEvent, community: Community) {
    e.stopPropagation()
    const target = e.target as HTMLElement
    const shiftX = e.clientX - target.getBoundingClientRect().left
    const shiftY = e.clientY - target.getBoundingClientRect().top
    setShiftPosition({ x: shiftX, y: shiftY })
    setSelectedCommunity(community)
    setIsMoveMode(false)
  }

  async function setCommunity(e: MouseEvent, parentCommunity: Community) {
    if (!selectedCommunity) return
    e.stopPropagation()
    const canAdd = checkLoopReference(selectedCommunity, parentCommunity.id)
    if (!canAdd) {
      if (selectedCommunity.id !== parentCommunity.id) {
        setNotificationMessage(`순환 참조 입니다.`)
      }
      setSelectedCommunity(undefined)
      return
    }
    selectedCommunity.parent = parentCommunity
    await saveCommunity(selectedCommunity)
    setSelectedCommunity(undefined)
    fetchData()
  }

  async function removeCommunity() {
    await dele(`/admin/community`, selectedCommunity)
    setSelectedCommunity(undefined)
    fetchData()
  }

  function checkLoopReference(
    checkCommunity: Community,
    parentId: number
  ): boolean {
    if (checkCommunity.id === parentId) return false
    const childList = communityList.filter((community) => {
      if (!community.parent) return false
      return community.parent.id === checkCommunity.id
    })
    return childList.every((child) => checkLoopReference(child, parentId))
  }

  async function resetParent() {
    if (!selectedCommunity) return
    selectedCommunity.parent = null
    await saveCommunity(selectedCommunity)
    setSelectedCommunity(undefined)
    fetchData()
  }

  async function saveCommunity(community: Community) {
    await put(`/admin/community`, community)
  }

  async function addCommunity() {
    await post(`/admin/community`, { name: "새로운 그룹", parentId: 0 })
    await fetchData()
  }

  function renderCommunityChildren(parentId: number, depth: number) {
    return communityList
      .filter((community) => community.parent?.id === parentId)
      .map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          depth={depth}
          editMode={editMode === EditMode.All ? "All" : "Folder"}
          communityList={communityList}
          selectedCommunity={selectedCommunity}
          clickedCommunity={clickedCommunity}
          isCommunityNameEditMode={isCommunityNameEditMode}
          clickedCommunityName={clickedCommunityName}
          onDoubleClick={() =>
            setCommunityStack([...communityStack, community])
          }
          onMouseUp={(e) => setCommunity(e, community)}
          onMouseDown={(e) => selectCommunity(e, community)}
          onNameDoubleClick={(e) => {
            e.stopPropagation()
            setClickedCommunityName(community.name)
            setClickedCommunity(community)
            setIsCommunityNameEditMode(true)
          }}
          onNameClick={() => setCommunityStack([...communityStack, community])}
          onNameChange={setClickedCommunityName}
          renderChildren={renderCommunityChildren}
        />
      ))
  }

  return (
    <Stack minHeight="100vh" sx={{ bgcolor: "#fafafa" }}>
      <Box p={2}>
        <CommunityControlPanel
          editMode={editMode}
          communityStack={communityStack}
          selectedCommunity={selectedCommunity}
          onEditModeChange={() =>
            setEditMode(
              editMode === EditMode.All ? EditMode.Folder : EditMode.All
            )
          }
          onAddCommunity={addCommunity}
          onRemoveCommunity={removeCommunity}
          onStackUpdate={setCommunityStack}
          onMouseUp={setCommunity}
          onMouseDown={selectCommunity}
          styles={styles}
        />

        <Stack
          p={2}
          gap={2}
          direction="row"
          sx={{
            mt: 2,
            display: "flex",
            direction: "row",
            flexWrap: "wrap",
            alignContent: "flex-start",
            flex: 1,
            bgcolor: "white",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          onMouseUp={() => resetParent()}
          onClick={() => {
            if (isCommunityNameEditMode) {
              setIsCommunityNameEditMode(false)
            } else if (clickedCommunity) {
              setClickedCommunity(undefined)
            }
          }}
        >
          {communityList
            .filter((community) => {
              if (communityStack.length === 0) return !community.parent
              return (
                community.parent?.id ===
                communityStack[communityStack.length - 1].id
              )
            })
            .map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                depth={0}
                editMode={editMode === EditMode.All ? "All" : "Folder"}
                communityList={communityList}
                selectedCommunity={selectedCommunity}
                clickedCommunity={clickedCommunity}
                isCommunityNameEditMode={isCommunityNameEditMode}
                clickedCommunityName={clickedCommunityName}
                onDoubleClick={() =>
                  setCommunityStack([...communityStack, community])
                }
                onMouseUp={(e) => setCommunity(e, community)}
                onMouseDown={(e) => selectCommunity(e, community)}
                onNameDoubleClick={(e) => {
                  e.stopPropagation()
                  setClickedCommunityName(community.name)
                  setClickedCommunity(community)
                  setIsCommunityNameEditMode(true)
                }}
                onNameClick={(e) => e.stopPropagation()}
                onNameChange={setClickedCommunityName}
                renderChildren={renderCommunityChildren}
              />
            ))}
          {selectedCommunity &&
            selectedCommunity.id &&
            isMoveMode &&
            !isCommunityNameEditMode && (
              <Stack
                position="absolute"
                top={mousePosition.y - shiftPosition.y}
                left={mousePosition.x - shiftPosition.x}
                sx={{
                  pointerEvents: "none",
                  zIndex: 1000,
                  opacity: 0.8,
                  transform: "rotate(-2deg) scale(1.05)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              >
                <CommunityCard
                  community={selectedCommunity}
                  depth={0}
                  editMode={editMode === EditMode.All ? "All" : "Folder"}
                  communityList={communityList}
                  selectedCommunity={selectedCommunity}
                  clickedCommunity={clickedCommunity}
                  isCommunityNameEditMode={isCommunityNameEditMode}
                  clickedCommunityName={clickedCommunityName}
                  onDoubleClick={() => {}}
                  onMouseUp={() => {}}
                  onMouseDown={() => {}}
                  onNameDoubleClick={() => {}}
                  onNameClick={() => {}}
                  onNameChange={() => {}}
                  renderChildren={renderCommunityChildren}
                />
              </Stack>
            )}
        </Stack>
      </Box>
    </Stack>
  )
}

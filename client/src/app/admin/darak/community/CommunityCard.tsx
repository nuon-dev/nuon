"use client"

import { type Community } from "@server/entity/community"
import { Card, Input, Stack, Typography, Box } from "@mui/material"
import { MouseEvent, ReactElement } from "react"

interface CommunityCardProps {
  community: Community
  depth?: number
  editMode: "All" | "Folder"
  communityList: Community[]
  selectedCommunity?: Community
  clickedCommunity?: Community
  isCommunityNameEditMode: boolean
  clickedCommunityName: string
  onDoubleClick: () => void
  onMouseUp: (e: MouseEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onNameDoubleClick: (e: MouseEvent) => void
  onNameClick: (e: MouseEvent) => void
  onNameChange: (value: string) => void
  renderChildren: (parentId: number, depth: number) => ReactElement[]
}

const DEPTH_COLORS = {
  0: "#1976d2",
  1: "#4caf50",
  2: "#ff9800",
  3: "#e91e63",
  default: "#9c27b0",
}

export default function CommunityCard({
  community,
  depth = 0,
  editMode,
  communityList,
  selectedCommunity,
  clickedCommunity,
  isCommunityNameEditMode,
  clickedCommunityName,
  onDoubleClick,
  onMouseUp,
  onMouseDown,
  onNameDoubleClick,
  onNameClick,
  onNameChange,
  renderChildren,
}: CommunityCardProps) {
  if (depth > 10) return null

  const hasChildren = communityList.some((c) => c.parent?.id === community.id)
  const isSelected = selectedCommunity?.id === community.id
  const isEditing =
    isCommunityNameEditMode && clickedCommunity?.id === community.id

  const getDepthColor = (depth: number): string => {
    return (
      DEPTH_COLORS[depth as keyof typeof DEPTH_COLORS] || DEPTH_COLORS.default
    )
  }

  const getCardStyles = () => ({
    border: "2px solid #e0e0e0",
    minHeight: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    borderRadius: 2,
    transition: "all 0.2s ease-in-out",
    position: "relative",
    "&::before":
      depth > 0
        ? {
            content: '""',
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            border: `2px solid ${getDepthColor(depth)}`,
            borderRadius: 2,
            zIndex: -1,
          }
        : {},
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transform: "translateY(-1px)",
      borderColor: "#1976d2",
    },
    ...(isSelected && {
      borderColor: "#1976d2",
      bgcolor: "#e3f2fd",
    }),
  })

  const getHeaderStyles = () => ({
    borderBottom:
      editMode === "All" && hasChildren
        ? `2px solid ${getDepthColor(depth)}`
        : "none",
    pb: editMode === "All" && hasChildren ? 1.5 : 0,
    mb: editMode === "All" && hasChildren ? 1 : 0,
  })

  const renderNameSection = () => (
    <>
      {isEditing ? (
        <Input
          value={clickedCommunityName}
          autoFocus
          onChange={(e) => onNameChange(e.target.value)}
          sx={{ flex: 1 }}
        />
      ) : (
        <Typography variant="body2" fontWeight="600" sx={{ flex: 1 }}>
          {community.name}
        </Typography>
      )}
    </>
  )

  const renderChildrenSection = () => {
    if (editMode !== "All" || !hasChildren) return null

    return (
      <Box
        sx={{
          mt: 1,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
        }}
      >
        <Stack gap={1} direction="row" flexWrap="wrap">
          {renderChildren(community.id, depth + 1)}
        </Stack>
      </Box>
    )
  }

  return (
    <Card
      onDoubleClick={onDoubleClick}
      sx={getCardStyles()}
      key={community.id}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
    >
      <Stack m={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          py={1}
          onDoubleClick={onNameDoubleClick}
          onClick={onNameClick}
          sx={getHeaderStyles()}
        >
          {renderNameSection()}
        </Stack>
        {renderChildrenSection()}
      </Stack>
    </Card>
  )
}

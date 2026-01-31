"use client"

import { Stack, Tabs, Tab, Box } from "@mui/material"
import { usePathname, useRouter } from "next/navigation"

const menuItems = [
  { label: "새신자 등록/조회", path: "/leader/newcomer/management" },
  { label: "교육 현황", path: "/leader/newcomer/education" },
  { label: "담당자 관리", path: "/leader/newcomer/managers" },
]

export default function NewcomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // 현재 경로가 메뉴 아이템 중 하나와 일치하거나 시작하는지 확인
  const currentTab = menuItems.findIndex(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/"),
  )

  function handleTabChange(_: React.SyntheticEvent, newValue: number) {
    router.push(menuItems[newValue].path)
  }

  // 메인 페이지(/leader/newcomer)에서는 탭을 표시하지 않음
  if (pathname === "/leader/newcomer") {
    return <Stack>{children}</Stack>
  }

  return (
    <Stack>
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}>
        <Tabs
          value={currentTab === -1 ? 0 : currentTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              minWidth: 120,
            },
          }}
        >
          {menuItems.map((item) => (
            <Tab key={item.path} label={item.label} />
          ))}
        </Tabs>
      </Box>
      {children}
    </Stack>
  )
}

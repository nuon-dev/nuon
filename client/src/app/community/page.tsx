"use client"

import CommunityHomeClient from "./CommunityHomeClient"
import { useSearchParams } from "next/navigation"

export default function CommunityHomePage() {
  const searchParams = useSearchParams()

  const slug = searchParams.get("slug")

  return <div>{slug && <div>현재 선택된 커뮤니티: {slug}</div>}</div>
}

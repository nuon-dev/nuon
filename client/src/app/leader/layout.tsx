"use client"

import Header from "@/app/leader/components/Header"

export default function LeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

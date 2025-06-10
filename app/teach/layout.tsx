import type React from "react"
import { TeachSidebar } from "@/components/teach-sidebar"
import { TeachHeader } from "@/components/teach-header"

export default function TeachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <TeachSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TeachHeader />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

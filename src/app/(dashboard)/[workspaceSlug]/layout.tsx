import Sidebar from '@/components/layout/sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceSlug: string }
}) {
  return (
    <div className="flex h-screen relative overflow-hidden bg-[#F5F7FF]">
      <Sidebar workspaceSlug={params.workspaceSlug} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <DashboardHeader workspaceSlug={params.workspaceSlug} />
        <main className="flex-1 overflow-y-auto dashboard-scroll relative">
          {children}
        </main>
      </div>
    </div>
  )
}

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
    <div className="flex h-screen bg-background">
      <Sidebar workspaceSlug={params.workspaceSlug} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader workspaceSlug={params.workspaceSlug} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import Sidebar from '@/components/layout/sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

function PixelCloud({ className = '', size = 10, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  const s = size
  const c = 'rgba(255,255,255,0.9)'
  return (
    <div className={className} style={style} aria-hidden="true">
      <div
        style={{
          width: s,
          height: s,
          background: c,
          boxShadow: [
            `${s}px 0 ${c}`,
            `${2 * s}px 0 ${c}`,
            `${3 * s}px 0 ${c}`,
            `${4 * s}px 0 ${c}`,
            `${5 * s}px 0 ${c}`,
            `${-s}px ${s}px ${c}`,
            `0 ${s}px ${c}`,
            `${s}px ${s}px ${c}`,
            `${2 * s}px ${s}px ${c}`,
            `${3 * s}px ${s}px ${c}`,
            `${4 * s}px ${s}px ${c}`,
            `${5 * s}px ${s}px ${c}`,
            `${6 * s}px ${s}px ${c}`,
            `${-s}px ${2 * s}px ${c}`,
            `0 ${2 * s}px ${c}`,
            `${s}px ${2 * s}px ${c}`,
            `${2 * s}px ${2 * s}px ${c}`,
            `${3 * s}px ${2 * s}px ${c}`,
            `${4 * s}px ${2 * s}px ${c}`,
            `${5 * s}px ${2 * s}px ${c}`,
            `${6 * s}px ${2 * s}px ${c}`,
          ].join(', '),
        }}
      />
    </div>
  )
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceSlug: string }
}) {
  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: '#00D4FF' }}>
      {/* Fixed Landscape Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Pixel Clouds */}
        <PixelCloud className="absolute top-[4%] animate-drift-slow" size={8} style={{ animationDelay: '0s' }} />
        <PixelCloud className="absolute top-[2%] animate-drift" size={12} style={{ animationDelay: '-12s' }} />
        <PixelCloud className="absolute top-[12%] animate-drift-reverse" size={6} style={{ animationDelay: '-5s' }} />
        <PixelCloud className="absolute top-[7%] animate-drift-slow" size={10} style={{ animationDelay: '-25s' }} />

        {/* Mountain Layers */}
        <svg
          className="absolute bottom-[12vh] left-0 w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{ height: '45vh' }}
        >
          <path
            d="M0 280 L80 220 L160 260 L240 180 L320 230 L400 160 L480 210 L560 130 L640 190 L720 140 L800 200 L880 130 L960 180 L1040 110 L1120 170 L1200 120 L1280 180 L1360 130 L1440 170 L1440 400 L0 400Z"
            fill="#8B8FC0"
          />
          <path
            d="M0 320 L100 260 L180 290 L280 210 L380 270 L460 200 L560 250 L660 180 L740 230 L840 170 L920 220 L1020 160 L1100 210 L1200 150 L1300 200 L1380 170 L1440 210 L1440 400 L0 400Z"
            fill="#7074AA"
          />
          <path
            d="M0 360 L120 300 L220 340 L340 270 L440 320 L560 260 L660 300 L780 240 L880 290 L980 230 L1080 280 L1180 230 L1300 270 L1400 240 L1440 260 L1440 400 L0 400Z"
            fill="#5C608E"
          />
        </svg>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: '12vh',
            backgroundColor: '#5B8C5A',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,0.06) 23px, rgba(0,0,0,0.06) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0,0,0,0.06) 23px, rgba(0,0,0,0.06) 24px)',
          }}
        />
      </div>

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

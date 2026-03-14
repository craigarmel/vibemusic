import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export default function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {showHeader && (
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle">
          <img src="/images/logo.png" alt="Synthetica" className="w-8 h-8" />
          <span className="text-neon-cyan font-bold text-lg tracking-wide">
            Synthetica
          </span>
        </header>
      )}
      <main className="flex-1">{children}</main>
    </div>
  )
}

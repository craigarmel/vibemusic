import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudioStore } from '../../stores/useStudioStore'
import Layout from '../../components/Layout'
import LoreGenerator from './LoreGenerator'
import AvatarGenerator from './AvatarGenerator'
import ArtistProfile from './ArtistProfile'
import TrackGallery from './TrackGallery'
import Toast from '../../components/Toast'

interface NavItem {
  icon: ReactNode
  label: string
  id: string
}

const creatorNavItems: NavItem[] = [
  {
    icon: <SvgIcon d="M2 2h20v20H2z M8 8h2v2H8z M14 8h2v2h-2z M8 14h2v2H8z M14 14h2v2h-2z" />,
    label: 'Studio',
    id: 'studio',
  },
  {
    icon: <SvgIcon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />,
    label: 'Library',
    id: 'library',
  },
  {
    icon: <SvgIcon d="M18 20V10 M12 20V4 M6 20v-6" />,
    label: 'Analytics',
    id: 'analytics',
  },
  {
    icon: <SvgIcon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15l.6.6a2 2 0 1 1-2.83 2.83" />,
    label: 'Settings',
    id: 'settings',
  },
]

const profileNavItems: NavItem[] = [
  {
    icon: <SvgIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
    label: 'Home',
    id: 'home',
  },
  {
    icon: <SvgIcon d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" />,
    label: 'Sessions',
    id: 'sessions',
  },
  {
    icon: <SvgIcon d="M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
    label: 'Tracks',
    id: 'tracks',
  },
  {
    icon: <SvgIcon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    label: 'Influences',
    id: 'influences',
  },
  {
    icon: <SvgIcon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15l.6.6a2 2 0 1 1-2.83 2.83" />,
    label: 'Settings',
    id: 'settings',
  },
]

function SvgIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function StudioDashboard() {
  const navigate = useNavigate()
  const { artist, error, setError, published_tracks } = useStudioStore()
  const hasArtist = artist !== null && artist.lore !== null

  const navItems = hasArtist ? profileNavItems : creatorNavItems
  const defaultNav = hasArtist ? 'home' : 'studio'
  const [activeNav, setActiveNav] = useState(defaultNav)

  // Switch to profile view when artist is created
  useEffect(() => {
    if (hasArtist && activeNav === 'studio') {
      setActiveNav('home')
    }
  }, [hasArtist])

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <ArtistProfile />
      case 'studio':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  AI Creator Studio
                </h1>
                <p className="text-text-muted text-sm">
                  Create your next virtual artist
                </p>
              </div>
              {artist && (
                <span className="text-neon-cyan text-sm font-mono">
                  {artist.lore?.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LoreGenerator />
              </div>
              <div className="space-y-6">
                {artist && <AvatarGenerator />}
              </div>
            </div>
          </div>
        )
      case 'tracks':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Track Gallery
                </h1>
                <p className="text-text-muted text-sm">
                  {published_tracks.length} track{published_tracks.length !== 1 ? 's' : ''} published
                </p>
              </div>
            </div>
            <TrackGallery tracks={published_tracks} />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted">Coming soon</p>
          </div>
        )
    }
  }

  return (
    <Layout showHeader={false}>
      <div className="flex h-screen bg-bg-dark">
        {/* Sidebar */}
        <aside className="w-56 flex flex-col border-r border-border-subtle">
          <div className="px-5 py-6">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="" className="w-7 h-7" />
              <div>
                <div className="text-white font-bold text-sm">Synthetica</div>
                <div className="text-text-muted text-[10px] uppercase tracking-widest">
                  Artist Portal
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                  activeNav === item.id
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            {/* Switch to Studio (when on profile nav) */}
            {hasArtist && activeNav !== 'studio' && (
              <button
                onClick={() => setActiveNav('studio')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 mt-4 border border-dashed border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 transition-colors"
              >
                <SvgIcon d="M12 5v14 M5 12h14" />
                <span>Edit Artist</span>
              </button>
            )}
          </nav>

          {/* Fan Feed link */}
          <div className="px-3 pb-3">
            <button
              onClick={() => navigate('/feed')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
            >
              <SvgIcon d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
              <span>Fan Feed</span>
            </button>
          </div>

          <div className="px-4 py-4 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-xs">
                S
              </div>
              <div>
                <div className="text-sm text-white">Saphirdev</div>
                <div className="text-[10px] text-text-muted">Pro Account</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <Toast message={error} type="error" onClose={() => setError(null)} />
          )}
          {renderContent()}
        </main>
      </div>
    </Layout>
  )
}

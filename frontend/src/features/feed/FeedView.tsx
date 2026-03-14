import { useEffect, useRef, useState, useCallback } from 'react'
import { useFeedStore } from '../../stores/useFeedStore'
import { getFeed, submitInfluence } from '../../api/feed'
import FeedCard from './FeedCard'
import TagSheet from './TagSheet'
import Toast from '../../components/Toast'

export default function FeedView() {
  const {
    feed_items,
    is_loading,
    error,
    tag_sheet_open,
    active_clip_id,
    influence_state,
    toast_message,
    setFeedItems,
    setLoading,
    setError,
    openTagSheet,
    closeTagSheet,
    setInfluenceState,
    resetInfluenceState,
    setToastMessage,
  } = useFeedStore()

  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Fetch feed data on mount
  useEffect(() => {
    let cancelled = false

    async function loadFeed() {
      setLoading(true)
      setError(null)
      try {
        const response = await getFeed()
        if (!cancelled && response.data) {
          setFeedItems(response.data.clips)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load feed')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFeed()
    return () => { cancelled = true }
  }, [setFeedItems, setLoading, setError])

  // IntersectionObserver to detect which card is in view
  useEffect(() => {
    const container = containerRef.current
    if (!container || feed_items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            if (!isNaN(index)) {
              setActiveIndex(index)
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    )

    cardRefs.current.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [feed_items])

  const setCardRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el)
    } else {
      cardRefs.current.delete(index)
    }
  }, [])

  // Handle influence button click on a card
  const handleInfluenceClick = useCallback(
    (clipId: string) => {
      openTagSheet(clipId)
    },
    [openTagSheet]
  )

  // Handle tag selection
  const handleSelectTag = useCallback(
    (tag: string) => {
      setInfluenceState({ selected_tag: tag })
    },
    [setInfluenceState]
  )

  // Handle influence submission
  const handleSubmitInfluence = useCallback(async () => {
    if (!influence_state.selected_tag || !active_clip_id) return

    // Find the active clip to get artist_id
    const clip = feed_items.find((item) => item.clip_id === active_clip_id)
    if (!clip) return

    setInfluenceState({ is_sending: true })

    try {
      await submitInfluence(clip.artist_id, active_clip_id, influence_state.selected_tag)
      resetInfluenceState()
      setToastMessage('Ton influence a ete prise en compte')
    } catch {
      setInfluenceState({ is_sending: false })
      setToastMessage('Erreur lors de l\'envoi')
    }
  }, [
    influence_state.selected_tag,
    active_clip_id,
    feed_items,
    setInfluenceState,
    resetInfluenceState,
    setToastMessage,
  ])

  // Loading state
  if (is_loading && feed_items.length === 0) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center">
        <div className="text-neon-cyan text-sm font-bold tracking-widest mb-6 neon-text">
          SYNTHETICA
        </div>
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm mt-4">Loading feed...</p>
      </div>
    )
  }

  // Error state
  if (error && feed_items.length === 0) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center px-6">
        <div className="text-neon-cyan text-sm font-bold tracking-widest mb-6 neon-text">
          SYNTHETICA
        </div>
        <p className="text-neon-magenta text-sm text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-neon-cyan text-sm underline"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (feed_items.length === 0) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center">
        <div className="text-neon-cyan text-sm font-bold tracking-widest mb-6 neon-text">
          SYNTHETICA
        </div>
        <p className="text-text-muted text-sm">No clips yet. Create some in the Studio!</p>
      </div>
    )
  }

  return (
    <div className="h-dvh w-full bg-black relative overflow-hidden">
      {/* Floating logo — top center */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div
          className="flex justify-center pt-3 pb-8"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        >
          <span className="text-neon-cyan text-sm font-bold tracking-[0.25em] neon-text">
            SYNTHETICA
          </span>
        </div>
      </div>

      {/* Snap-scroll container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {feed_items.map((item, index) => (
          <div
            key={item.clip_id}
            ref={(el) => setCardRef(index, el)}
            data-index={index}
            className="h-dvh w-full flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <FeedCard
              item={item}
              isActive={index === activeIndex}
              onInfluenceClick={() => handleInfluenceClick(item.clip_id)}
            />
          </div>
        ))}
      </div>

      {/* Tag Sheet */}
      <TagSheet
        isOpen={tag_sheet_open}
        selectedTag={influence_state.selected_tag}
        isSending={influence_state.is_sending}
        onSelectTag={handleSelectTag}
        onSubmit={handleSubmitInfluence}
        onClose={closeTagSheet}
      />

      {/* Confirmation Toast */}
      {toast_message && (
        <Toast
          message={toast_message}
          type="success"
          duration={3000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}

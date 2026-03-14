import { create } from 'zustand'
import type { FeedItem, InfluenceState } from '../types/feed'

interface FeedState {
  feed_items: FeedItem[]
  is_loading: boolean
  influence_state: InfluenceState | null
  error: string | null

  setFeedItems: (items: FeedItem[]) => void
  setLoading: (val: boolean) => void
  setInfluenceState: (state: InfluenceState | null) => void
  setError: (error: string | null) => void
}

export const useFeedStore = create<FeedState>((set) => ({
  feed_items: [],
  is_loading: false,
  influence_state: null,
  error: null,

  setFeedItems: (items) => set({ feed_items: items }),
  setLoading: (val) => set({ is_loading: val }),
  setInfluenceState: (state) => set({ influence_state: state }),
  setError: (error) => set({ error }),
}))

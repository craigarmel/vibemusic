import { create } from 'zustand'
import type { FeedItem, InfluenceState, ArtistInfluences } from '../types/feed'

interface FeedState {
  feed_items: FeedItem[]
  is_loading: boolean
  influence_state: InfluenceState
  error: string | null
  active_clip_id: string | null
  tag_sheet_open: boolean
  toast_message: string | null
  artist_influences: ArtistInfluences | null

  setFeedItems: (items: FeedItem[]) => void
  setLoading: (val: boolean) => void
  setInfluenceState: (state: Partial<InfluenceState>) => void
  resetInfluenceState: () => void
  setError: (error: string | null) => void
  setActiveClipId: (id: string | null) => void
  openTagSheet: (clipId: string) => void
  closeTagSheet: () => void
  setToastMessage: (msg: string | null) => void
  setArtistInfluences: (data: ArtistInfluences | null) => void
}

const DEFAULT_INFLUENCE_STATE: InfluenceState = {
  selected_tag: null,
  is_sending: false,
  confirmation_shown: false,
}

export const useFeedStore = create<FeedState>((set) => ({
  feed_items: [],
  is_loading: false,
  influence_state: { ...DEFAULT_INFLUENCE_STATE },
  error: null,
  active_clip_id: null,
  tag_sheet_open: false,
  toast_message: null,
  artist_influences: null,

  setFeedItems: (items) => set({ feed_items: items }),
  setLoading: (val) => set({ is_loading: val }),
  setInfluenceState: (partial) =>
    set((state) => ({
      influence_state: { ...state.influence_state, ...partial },
    })),
  resetInfluenceState: () =>
    set({
      influence_state: { ...DEFAULT_INFLUENCE_STATE },
      tag_sheet_open: false,
      active_clip_id: null,
    }),
  setError: (error) => set({ error }),
  setActiveClipId: (id) => set({ active_clip_id: id }),
  openTagSheet: (clipId) =>
    set({
      tag_sheet_open: true,
      active_clip_id: clipId,
      influence_state: { ...DEFAULT_INFLUENCE_STATE },
    }),
  closeTagSheet: () =>
    set({
      tag_sheet_open: false,
      influence_state: { ...DEFAULT_INFLUENCE_STATE },
    }),
  setToastMessage: (msg) => set({ toast_message: msg }),
  setArtistInfluences: (data) => set({ artist_influences: data }),
}))

export interface FeedItem {
  clip_id: string
  artist_id: string
  artist_name: string
  artist_avatar_url: string | null
  track_title: string
  video_url: string
  duration: string
  likes: number
  created_at: string
}

export interface InfluenceTag {
  tag: string
  is_trending?: boolean
}

export interface InfluenceState {
  selected_tag: string | null
  is_sending: boolean
  confirmation_shown: boolean
}

export interface TagCount {
  tag: string
  count: number
}

export interface ArtistInfluences {
  artist_id: string
  total_influences: number
  tags: TagCount[]
}

export interface FeedResponse {
  clips: FeedItem[]
  total: number
}

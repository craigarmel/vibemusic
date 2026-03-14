---
stepsCompleted: [1, 2]
inputDocuments:
  - prd.md
  - architecture.md
status: 'complete'
completedAt: '2026-03-14'
---

# UX Design Specification — Synthetica (vibemusic)

**Author:** Saphirdev
**Date:** 2026-03-14

---

## Executive Summary

### Project Vision

Synthetica is the first End-to-End AI virtual idol platform. Labels (B2B) sculpt AI artists through live performance sessions where Lyria RealTime reacts to the artist's voice, movements and ambiance. Fans (B2C) consume generated content in a TikTok-style feed and influence the next session through interactive tags. A continuous feedback loop connects fan input to the next live session.

### Target Users

**1. Artist / Label A&R (B2B)**
- Launches live sessions to create AI-generated music
- Performs live (camera + mic) while Lyria generates reactive music
- Needs an immersive, stage-like interface with minimal distractions
- Devices: Desktop/laptop (primary), large screens for presentation

**2. Fan (B2C)**
- Scrolls a vertical feed to discover AI-generated music clips
- Watches auto-playing vertical videos (9:16)
- Influences the next session via tags ("Plus sombre", "Plus de basses")
- Devices: Mobile (primary), responsive desktop secondary

### Key Design Challenges

- **Live session immersion**: The B2B view must feel like a performance stage, not a dashboard. Camera/mic activation, real-time audio visualization, minimal UI during performance
- **Real-time feedback visualization**: The artist must SEE that the music reacts — audio waveforms, visual pulses, neon particle effects
- **Fan influence UX**: The "Influencer" action must feel impactful yet non-disruptive to the scroll experience
- **Session-to-publication transition**: End of session → final track → auto-publish must feel seamless and rewarding

### Design Opportunities

- Dark/neon aesthetic creates a strong "AI music studio from the future" identity
- Live session UI itself becomes part of the performance spectacle
- Fan influence tags create a sense of co-creation and community
- The feedback loop (fan → session → new track → feed) creates a compelling engagement cycle

---

## User Flows

### Flow 1: Artist Live Session (B2B)

```
[Artist Page] → [Launch Live Session] → [Camera/Mic Activate]
     ↓
[Lyria captures ambiance in real-time]
     ↓
[Music generates and evolves during entire session]
[Artist performs — music reacts in real-time]
     ↓
[End Session]
     ↓
[Lyria generates final consolidated track]
     ↓
[Track auto-published to artist space]
```

**Screens:**
1. **Artist Profile / Home** — Artist identity, past sessions, published tracks
2. **Pre-Session** — "Start Live Session" CTA, mic/camera permissions prompt
3. **Live Session (Active)** — Full-screen immersive view: camera feed, real-time audio visualizer, session timer, minimal controls (end session, mute)
4. **Session Complete** — Final track preview, waveform, auto-publish confirmation
5. **Artist Space** — Published tracks gallery, fan influence tags received

### Flow 2: Fan Feed (B2C)

```
[Fan Feed] → [Scroll] → [Clip autoplay (vertical 9:16)]
     ↓
[Watch full-screen video]
     ↓
[Tap "Influence"] → [Choose tag: "Plus sombre"] → [Confirmation toast]
     ↓
[Continue scrolling]
```

**Screens:**
1. **Feed View** — TikTok-style vertical scroll, auto-playing clips, artist name overlay
2. **Influence Overlay** — Tag selection sheet (slides up from bottom), pre-defined tags + custom
3. **Confirmation** — Toast: "Ton influence a ete prise en compte"

### Flow 3: Feedback Loop (Session ← Fan)

```
[Fan sends tag during/after session]
     ↓
[Tag signal stored as influence data]
     ↓
[Artist's next session incorporates fan input]
     ↓
[New track generated with influence]
     ↓
[Published to feed — cycle continues]
```

---

## Visual Design Direction

### Theme: "Neon Studio"

- **Background:** Deep black (#0a0a0a) to near-black gradients
- **Primary accent:** Electric cyan/teal (#00f0ff) — neon glow
- **Secondary accent:** Hot pink/magenta (#ff00aa) — for CTAs and highlights
- **Tertiary:** Purple (#8b5cf6) — gradients and depth
- **Text:** White (#ffffff) primary, muted gray (#a0a0a0) secondary
- **Effects:** Glow effects on active elements, subtle neon borders, gradient overlays on dark surfaces

### Typography

- **Headings:** Bold, clean sans-serif (Inter or similar) — all caps for section titles
- **Body:** Regular weight sans-serif for readability
- **Accent text:** Monospace for technical/data elements (session timers, track IDs)

### Key Visual Elements

- **Audio visualizer:** Animated waveform/frequency bars with neon glow during live sessions
- **Neon borders:** Subtle glowing borders on cards and active elements
- **Gradient overlays:** Dark-to-transparent gradients on video content
- **Micro-animations:** Pulse effects on "Influence" button, smooth transitions between states
- **Glass morphism:** Semi-transparent panels with backdrop blur for overlays

---

## Component Architecture (UX)

### B2B Components

| Component | Description | Key Interactions |
|-----------|-------------|-----------------|
| `ArtistProfile` | Artist identity card, avatar, stats | View-only |
| `SessionLauncher` | "Start Live Session" CTA with mic/cam check | Tap → permissions → session starts |
| `LiveSessionView` | Full-screen immersive performance view | Camera feed, audio visualizer, end button |
| `AudioVisualizer` | Real-time frequency/waveform display | Animated, reacts to Lyria output |
| `SessionComplete` | Post-session summary, final track preview | Play preview, confirm publish |
| `TrackGallery` | Published tracks list | Play, view influence tags |

### B2C Components

| Component | Description | Key Interactions |
|-----------|-------------|-----------------|
| `FeedView` | Vertical scroll container | Swipe up/down, auto-play |
| `FeedCard` | Single video clip (9:16 full-screen) | Auto-play, tap for pause |
| `ArtistOverlay` | Artist name + avatar on video | Tap → artist profile |
| `InfluenceButton` | "Influencer" floating action button | Tap → tag sheet |
| `TagSheet` | Bottom sheet with influence tags | Select tag → confirm |
| `ConfirmToast` | "Ton influence a ete prise en compte" | Auto-dismiss after 3s |

---

## Stitch Design Prompt

The following prompt is ready to paste into Stitch to generate the UI mockups:

---

### STITCH PROMPT

```
Design a mobile-first web application called "Synthetica" — an AI-powered virtual idol platform with a dark neon aesthetic.

## Global Design System
- Background: deep black (#0a0a0a) with subtle dark gradients
- Primary accent: electric cyan/teal (#00f0ff) with neon glow effects
- Secondary accent: hot pink/magenta (#ff00aa) for CTAs and highlights
- Tertiary: purple (#8b5cf6) for gradients and depth
- Text: white (#ffffff) primary, muted gray (#a0a0a0) secondary
- Style: dark futuristic music studio aesthetic, neon glows, glass morphism panels with backdrop blur, subtle neon borders on cards
- Typography: clean modern sans-serif (Inter), all-caps bold headings, monospace for data/timers
- Border radius: rounded-xl on cards, full-round on buttons
- Spacing: generous padding, airy layouts

## Screen 1: Artist Live Session Page (Desktop B2B)
Full-screen immersive dark interface for a music artist performing a live AI session.

Layout:
- Top bar: minimal — artist avatar (small circle, neon border) + artist name on left, session timer (monospace, cyan glow) centered, "End Session" button (red/pink, rounded) on right
- Center (60% of screen): large camera feed placeholder (rounded-2xl, subtle neon cyan border glow). Show a dark rectangle with a play icon or silhouette placeholder representing the artist's webcam feed
- Bottom third: a wide audio visualizer — horizontal bar chart / frequency waveform with ~30 vertical bars of varying heights, colored in a cyan-to-purple gradient with neon glow. This represents Lyria generating music in real-time
- Bottom left corner: small "Mute Mic" icon button (glass morphism circle)
- Bottom right corner: small "Fan Influences" badge showing "3 tags received" with a subtle pink glow
- Overall feel: immersive, stage-like, minimal chrome — the artist IS the focus. Dark with strategic neon accents

## Screen 2: Session Complete (Desktop B2B)
The screen shown after an artist ends their live session.

Layout:
- Centered card (max-width 600px, glass morphism background with backdrop blur, neon border)
- Top of card: "Session Complete" heading in cyan, large checkmark icon with glow animation
- Waveform visualization of the final generated track (horizontal, cyan/purple gradient, static — not animated)
- Track details: "Track #042 — Generated 2:34 ago" in monospace gray text
- Play button (large, centered, cyan filled circle with play icon)
- Duration: "3:42" next to a thin progress bar
- "Fan Influences Applied" section: 3 small tag pills ("Plus sombre", "Plus de basses", "Electro vibes") in pink/purple glass morphism pills
- Large CTA button at bottom: "Publish to Artist Space" — full-width, gradient cyan-to-purple, bold white text, neon glow on hover
- Secondary link below: "Save as Draft" in muted gray

## Screen 3: Fan Feed (Mobile B2C)
TikTok-style vertical video feed. Design for mobile (375px width).

Layout:
- Full-screen vertical video card (9:16 aspect ratio) — show a dark abstract/generative art placeholder representing an AI music video. Use dark purple/cyan gradient abstract shapes
- Bottom overlay (gradient from transparent to black):
  - Artist avatar (small circle, neon border) + "@synthartist_01" name in white bold
  - Track title: "Neon Dreams Vol. 3" in white
  - Small waveform icon + "2:14" duration in gray
- Right side floating action buttons (vertical stack, glass morphism circles):
  - Heart icon with count "1.2K"
  - Share icon
  - "Influence" button — SPECIAL: larger than others, pink/magenta gradient fill with glow, lightning bolt icon inside. This is the key CTA
- Top: subtle status bar with "Synthetica" logo text in cyan, small and minimal
- Swipe indicator: thin line at bottom center (standard mobile gesture bar)

## Screen 4: Influence Tag Sheet (Mobile B2C)
Bottom sheet overlay on top of the feed video. The video is still visible but dimmed behind.

Layout:
- Bottom sheet (slides up from bottom, ~40% screen height, glass morphism dark background with backdrop blur, rounded-t-2xl)
- Handle bar at top (thin gray pill, centered)
- Title: "Influence the next session" in white bold
- Subtitle: "Ton choix orientera la prochaine creation" in muted gray
- Tag grid (3 columns, gap-3):
  - Pre-defined tags as pills/chips: "Plus sombre", "Plus de basses", "Plus rapide", "Electro vibes", "Ambient", "Voix douce", "Hardcore", "Melodique", "Experimental"
  - Each tag: glass morphism pill with neon border (cyan), white text. Selected state: filled gradient cyan-to-purple with white text
  - One highlighted/promoted tag with pink border: "Trending: Plus sombre"
- Bottom: "Send Influence" CTA button — full-width, magenta/pink gradient, white bold text, neon glow
- Behind the sheet: the video feed is still visible but with a dark overlay (50% opacity black)

## Screen 5: Artist Profile / Home (Desktop B2B)
The artist's home page showing their identity and published tracks.

Layout:
- Left sidebar (narrow, 80px, dark glass morphism): icon-only nav — home, sessions, tracks, influences, settings. Active item has cyan accent line
- Main content area:
  - Hero section: large artist avatar (200px circle, animated neon border glow), artist name large in white, genre tags in small cyan pills ("Techno", "Dark Ambient"), bio text in gray
  - Stats row: 3 glass morphism cards in a row — "Sessions: 12", "Tracks: 42", "Fan Influences: 847" — each with an icon and cyan accent number
  - "Start New Session" — large CTA button, gradient cyan-to-purple, centered, neon glow
  - "Published Tracks" section below: grid of track cards (2 columns). Each card: dark glass morphism, small waveform visual, track name, duration, date, and small influence tag count badge in pink

Generate all 5 screens as high-fidelity mockups with the consistent dark neon design system described above. Every element should feel cohesive — like one premium product.
```

---

This prompt is ready to paste into Stitch. It covers all 5 key screens with detailed layout instructions, the consistent neon design system, and specific component descriptions.

**Here's what I'll save to the UX document** (everything above has been drafted).

**What would you like to do?**

- **[A]** Advanced Elicitation - Refine the Stitch prompt further
- **[P]** Party Mode - Get different perspectives on the UX direction
- **[C]** Continue - Save this UX spec and complete the workflow
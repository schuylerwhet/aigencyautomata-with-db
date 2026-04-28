# Reddit Growth Agent

## Goal

Build a standalone admin page (`/admin/reddit-agent`) that lets admin input product/service details, scrapes Reddit for relevant posts/conversations, generates AI reply suggestions via Gemini, and tracks engagement history — all stored in Blink DB.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  /admin/reddit-agent (AdminRedditAgent.tsx)      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Products │  │ Search   │  │ Engagement    │  │
│  │ Manager  │  │ Results  │  │ History       │  │
│  │ (CRUD)   │  │ + Drafts │  │ + Tracking    │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────┘
        │              │               │
        ▼              ▼               ▼
┌─────────────────────────────────────────────────┐
│  services/reddit.ts    services/gemini.ts (ext)  │
│  - searchReddit()      - generateReplyDraft()    │
│  - findSubreddits()                              │
└─────────────────────────────────────────────────┘
        │                       │
        ▼                       ▼
   Reddit JSON API        Gemini API
   (public, no auth)      (existing key)
```

## Blink DB Tables

- `reddit_products` — saved product profiles (name, description, url, keywords)
- `reddit_opportunities` — discovered posts with AI draft replies + status (new/replied/skipped)

## Tasks

- [x] **Task 1**: Create `services/reddit.ts` — Reddit scraper using public JSON API (`reddit.com/search.json`, `reddit.com/r/{sub}/search.json`)  
  → Verify: `searchReddit("ai automation agency")` returns array of posts with title, subreddit, url, body, score, created

- [x] **Task 2**: Add `generateRedditReply()` to `services/gemini.ts` — Takes product context + post content, returns a natural, non-spammy reply draft  
  → Verify: Function returns a contextual reply string

- [x] **Task 3**: Create `src/hooks/useRedditAgent.ts` — Custom hook managing products CRUD, search execution, reply generation, opportunity tracking (all via Blink DB)  
  → Verify: Hook exposes `products`, `opportunities`, `searchReddit`, `generateReply`, `markAsReplied`, `saveProduct`

- [x] **Task 4**: Create `pages/AdminRedditAgent.tsx` — Full-featured admin page with 3 sections:  
  1. **Product Profiles** — Form to add/edit/select a product (name, description, URL, keywords)  
  2. **Reddit Scanner** — Search button, results as cards showing post title, subreddit, score, snippet, with "Generate Reply" button per result  
  3. **Engagement Tracker** — Table of all opportunities with status (New/Replied/Skipped), generated reply, reddit link  
  → Verify: Page renders correctly at `/admin/reddit-agent`

- [x] **Task 5**: Wire into app — Add route in `App.tsx`, add sidebar nav item in `PortalLayout.tsx`  
  → Verify: Sidebar shows "Reddit Agent" link, clicking navigates to the page

- [x] **Task 6**: Visual polish — Match existing admin design language (black/red, font-mono, uppercase tracking, red-600 accents, Card components). Add loading states, empty states, toast feedback  
  → Verify: Page looks cohesive with other admin pages, no visual jarring

## Done When

- [x] Admin can save a product profile
- [x] Admin can search Reddit and see relevant posts
- [x] Admin can generate AI reply drafts for each post
- [x] Admin can copy reply and mark post as "replied"
- [x] Engagement history persists across sessions
- [x] UI matches admin portal design system

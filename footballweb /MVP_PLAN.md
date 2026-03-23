# FootballWeb MVP Plan

## 1. Product Direction

Build a web product for amateur 7-a-side teams with one strong weekly use case:

- manage team and match schedule
- post urgent requests when a team is missing players
- browse nearby fields as supporting data

This is more viable than starting with a pure "list fields + find opponent" marketplace because one team can still get value even if the network is small.

## 2. Target Market

Start with one small area where you already have some network:

- one city
- ideally one district or two nearby districts
- focus on office teams and casual evening matches

Example positioning:

"Tool for 7-a-side teams to organize matches and find last-minute players."

## 3. MVP Goal

Validate that teams will return weekly, not just visit once.

Primary success signals:

- captains create teams and invite members
- teams create weekly match events
- urgent player posts receive responses
- users come back every week to manage attendance

## 4. Core User Flows

### Captain flow

1. Sign up
2. Create team
3. Add team members by invite link
4. Create a match event with time and field
5. Mark that the team still needs 1-3 players
6. Publish urgent player post
7. Review join requests and accept players
8. Close match after it ends

### Player flow

1. Sign up
2. Set profile, position, skill level, area
3. Browse urgent player posts
4. Filter by district, time, skill, distance
5. Request to join
6. Contact captain after approval

## 5. MVP Scope

### P0: must have

- authentication
- player profile
- team creation and team member management
- match event creation
- urgent player post linked to a match
- basic field directory
- filters by district and time
- join request flow
- public share link for each urgent post
- simple admin moderation for posts

### P1: after first validation

- find opponent posts
- attendance RSVP
- notifications by email or Telegram
- field review and rating
- team review and no-show flag
- cost split tracking

### Not in MVP

- nationwide rollout
- booking and payment integration
- in-app chat
- AI matching
- Elo ranking
- tournament engine
- native mobile app

## 6. Recommended Stack

Keep it boring and fast to ship.

- frontend: Next.js
- backend: NestJS
- database: PostgreSQL
- ORM: Prisma
- background jobs: use cron or database-driven jobs first
- auth: email magic link or Google login for MVP
- file storage: skip unless you really need uploads
- deploy frontend: Vercel
- deploy backend/db: Railway, Render, or Neon + Render

Suggested repo structure:

- `apps/web`
- `apps/api`
- `packages/shared`

## 7. Data Model

### users

- id
- name
- email
- phone nullable
- avatar_url nullable
- home_district nullable
- skill_level enum (`beginner`, `intermediate`, `advanced`)
- preferred_positions text[]
- created_at

### teams

- id
- name
- slug
- city
- district
- description nullable
- skill_level enum
- created_by
- created_at

### team_members

- id
- team_id
- user_id
- role enum (`captain`, `manager`, `member`)
- joined_at

### fields

- id
- name
- address
- city
- district
- google_maps_url nullable
- pitch_type enum (`5`, `7`, `11`)
- price_range nullable
- contact_phone nullable
- verified boolean

### matches

- id
- team_id
- field_id nullable
- title
- starts_at
- ends_at
- district
- status enum (`draft`, `open`, `full`, `completed`, `cancelled`)
- notes nullable
- created_by
- created_at

### urgent_player_posts

- id
- match_id
- team_id
- needed_players int
- skill_level enum nullable
- fee_share nullable
- description nullable
- expires_at
- status enum (`open`, `closed`, `expired`)
- created_at

### urgent_post_applications

- id
- post_id
- user_id
- message nullable
- status enum (`pending`, `accepted`, `rejected`, `cancelled`)
- created_at

### optional later

- notifications
- field_reviews
- team_reviews
- attendance_records

## 8. API Outline

### auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### users

- `GET /users/me`
- `PATCH /users/me`

### teams

- `POST /teams`
- `GET /teams/:id`
- `PATCH /teams/:id`
- `POST /teams/:id/invite`
- `POST /teams/:id/members`
- `PATCH /teams/:id/members/:memberId`

### fields

- `GET /fields`
- `GET /fields/:id`
- `POST /fields` admin only

### matches

- `POST /matches`
- `GET /matches/:id`
- `PATCH /matches/:id`
- `GET /teams/:id/matches`

### urgent player posts

- `POST /urgent-posts`
- `GET /urgent-posts`
- `GET /urgent-posts/:id`
- `PATCH /urgent-posts/:id`
- `POST /urgent-posts/:id/apply`
- `POST /urgent-posts/:id/applications/:applicationId/accept`
- `POST /urgent-posts/:id/applications/:applicationId/reject`

### admin

- `GET /admin/urgent-posts`
- `PATCH /admin/urgent-posts/:id/moderate`

## 9. Frontend Pages

### Public pages

- `/`
- `/urgent-posts`
- `/urgent-posts/[slug-or-id]`
- `/fields`
- `/fields/[id]`

### Authenticated pages

- `/dashboard`
- `/teams/new`
- `/teams/[id]`
- `/teams/[id]/matches/new`
- `/matches/[id]`
- `/profile`

### Admin pages

- `/admin/posts`

## 10. Roadmap: 2 Weeks

### Week 1

#### Day 1

- initialize monorepo
- setup Next.js and NestJS
- connect PostgreSQL
- configure Prisma
- define initial schema

#### Day 2

- implement auth
- implement user profile
- seed sample fields for one district

#### Day 3

- implement team creation
- implement team member roles
- create team pages

#### Day 4

- implement match creation
- team match list
- match detail page

#### Day 5

- implement urgent player posts
- public post listing with filters
- public post detail page

#### Day 6

- implement join request flow
- captain accepts or rejects players

#### Day 7

- polish forms
- add validation
- fix obvious UX gaps

### Week 2

#### Day 8

- build field directory page
- district filter
- basic SEO metadata

#### Day 9

- add shareable links for posts
- add simple empty states and loading states

#### Day 10

- add admin moderation page
- add status transitions for open/closed/expired posts

#### Day 11

- seed realistic demo data
- test main flows end to end

#### Day 12

- deploy staging
- test on mobile web

#### Day 13

- onboard 3-5 real teams from one local area
- collect feedback

#### Day 14

- ship first production version
- measure usage for one week

## 11. Launch Strategy

Do not launch broadly.

- pick one local area you can personally seed
- onboard captains first, not random players
- create 20-30 field records manually for that area
- create 10 demo urgent posts so the site does not look empty
- ask each captain to invite their squad through one team link

## 12. Metrics to Track

Track only the metrics that prove repeat usage.

- new teams created per week
- matches created per week
- urgent posts created per week
- average applications per urgent post
- time to first application
- weekly active captains
- weekly active players

Good early signs:

- 10+ active teams in one area
- 3+ matches created per team per month
- at least 30 percent of urgent posts get one accepted player

## 13. Product Risks

### Risk 1: empty marketplace

Mitigation:

- start from team management, not marketplace only
- seed demo data
- focus on one area

### Risk 2: low trust between strangers

Mitigation:

- show basic profile info
- show skill level
- allow captains to approve manually

### Risk 3: users stay on Zalo/Facebook

Mitigation:

- do not fight chat early
- use shareable links
- solve the organization problem better than chat

## 14. Decision Rule After MVP

Continue only if these signals are real after 4-6 weeks:

- captains return weekly without being chased
- urgent posts get responses fast enough
- users ask for the next feature themselves

If not, pivot to a simpler B2B tool for field owners or team management only.

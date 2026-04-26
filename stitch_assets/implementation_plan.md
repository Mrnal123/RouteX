# RouteX: Full React/Next.js Migration with Antigravity Design

Migrate the static HTML RouteX application to a production-grade Next.js 15 app with GSAP animations, Three.js WebGL backgrounds, authentication, and MCP-sourced UI components (21st.dev + uilora).

## User Review Required

> [!IMPORTANT]
> This is a **complete frontend rebuild** from 5 static HTML files into a Next.js App Router project with ~15+ React components. The static HTML files will be preserved but the new app will live in a `routex-app/` subfolder.

> [!WARNING]
> **Three.js/WebGL**: A particle-mesh background will be added to the landing page and auth pages. This requires a GPU-capable browser. Fallback gradients will be included.

## Proposed Changes

### Phase 1: Project Scaffold
- Initialize Next.js 15 with TypeScript, Tailwind CSS, App Router, and `src/` directory
- Install dependencies: `gsap`, `@gsap/react`, `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`, `framer-motion`
- Set up the Antigravity design system (CSS variables, glass utilities, color tokens)

### Phase 2: Shared Components (from MCP + custom)
- **uilora**: `holographic-nav` (cyberpunk nav with cyan glow — perfect match for RouteX)
- **uilora**: `magnetic-footer` (magnetic cursor-tracking footer)
- **21st.dev**: Adapted `SignIn1` auth component (glassmorphism login)
- **Custom**: `AntigravityGlass` wrapper, `GlowButton`, `StatCard`, `SideNav`

### Phase 3: Pages (App Router)
| Route | Source HTML | Description |
|---|---|---|
| `/` | `routex_landing_page.html` | Hero + Three.js particle background + GSAP scroll |
| `/auth/login` | NEW | Glassmorphism sign-in with email/password + Google |
| `/auth/register` | NEW | Matching sign-up page |
| `/dashboard` | `routex_dashboard.html` | Map canvas + AI decision log + live orders |
| `/dashboard/orders` | `routex_orders_management.html` | Orders table with filters |
| `/dashboard/analytics` | `routex_analytics_v2.html` | Bento charts + kinetic heatmap |
| `/dashboard/settings` | `routex_settings.html` | Account & system preferences |

### Phase 4: Animation Layer
- GSAP ScrollTrigger for landing page section reveals
- Three.js particle mesh background (landing + auth pages)
- Framer Motion for page transitions and micro-interactions
- CSS `@keyframes` for ambient breathing/floating effects

### Phase 5: Uniform Design System
- Consistent `antigravity-glass` utility across all pages
- Unified color tokens: `--primary: #99f7ff`, `--primary-container: #00f1fe`, etc.
- Shared typography: Manrope (headlines) + Inter (body)
- Shared border-radius, shadows, and rim-lighting

## File Structure

```
routex-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts + metadata
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Antigravity design system
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx        # Dashboard shell (sidebar + topnav)
│   │       ├── page.tsx          # Dashboard overview (map)
│   │       ├── orders/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── components/
│   │   ├── ui/                   # MCP-sourced components
│   │   │   ├── holographic-nav.tsx
│   │   │   └── magnetic-footer.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── PulseLoop.tsx
│   │   │   ├── CapabilityStack.tsx
│   │   │   └── FinalCTA.tsx
│   │   ├── dashboard/
│   │   │   ├── SideNav.tsx
│   │   │   ├── TopNav.tsx
│   │   │   ├── MapCanvas.tsx
│   │   │   ├── AIDecisionLog.tsx
│   │   │   └── StatCard.tsx
│   │   ├── auth/
│   │   │   └── SignInForm.tsx
│   │   ├── three/
│   │   │   └── ParticleField.tsx   # WebGL background
│   │   └── shared/
│   │       ├── AntigravityGlass.tsx
│   │       └── GlowButton.tsx
│   └── lib/
│       └── gsap.ts               # GSAP registration helper
```

## Verification Plan

### Automated Tests
- `npm run build` — ensure zero build errors
- `npm run dev` — verify all routes render

### Manual Verification
- Open each page in the browser and confirm:
  - Animations play on scroll/load
  - Three.js background renders
  - Auth forms validate and submit
  - Dashboard sidebar navigation works
  - Design is uniform across all pages

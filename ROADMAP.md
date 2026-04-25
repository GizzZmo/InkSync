# InkSync Project Roadmap

This document is the single source of truth for the InkSync development plan. It is organized into phases, each representing a focused period of development with clear goals and measurable outcomes.

> **Legend:**
> - ✅ Completed
> - 🚧 In Progress
> - 🔲 Planned
> - ❌ Blocked
> - 🔁 Recurring

---

## Table of Contents

1. [Phase 1 – Foundation (Q3 2024)](#phase-1--foundation-q3-2024)
2. [Phase 2 – Engagement (Q4 2024)](#phase-2--engagement-q4-2024)
3. [Phase 3 – Innovation (Q1 2025)](#phase-3--innovation-q1-2025)
4. [Phase 4 – Scaling (Q2 2025)](#phase-4--scaling-q2-2025)
5. [Phase 5 – Maturity & Ecosystem (Q3–Q4 2025)](#phase-5--maturity--ecosystem-q3q4-2025)
6. [Ongoing / Cross-Cutting Concerns](#ongoing--cross-cutting-concerns)
7. [Completed Features](#completed-features)
8. [Deferred / Backlog](#deferred--backlog)

---

## Phase 1 – Foundation (Q3 2024)

**Goal:** Establish the core infrastructure and MVP feature set.  Deliver a working platform that artists and clients can register on and use for basic bookings.

### Milestone 1.1 – Auth & Identity
| Status | Task |
|--------|------|
| ✅ | User authentication for Artists & Clients (Auth0 / Firebase Auth) |
| ✅ | Role-based access control (Artist, Client, Studio Owner, Admin) |
| ✅ | OAuth 2.0 social login (Google, Apple) |
| ✅ | Email verification and password-reset flows |
| ✅ | Session management with JWT + refresh tokens |

### Milestone 1.2 – Artist Profiles & Portfolio
| Status | Task |
|--------|------|
| ✅ | Artist profile creation (bio, style tags, location, social links) |
| ✅ | Portfolio image uploads to AWS S3 with CDN delivery |
| ✅ | Filterable gallery by style (Blackwork, Traditional, Realism, Neo-Trad, Watercolor, etc.) |
| ✅ | Image optimization pipeline (WebP conversion, lazy loading) |
| ✅ | Public artist profile page with shareable URL |

### Milestone 1.3 – Core Booking System
| Status | Task |
|--------|------|
| ✅ | Artist availability calendar (set working hours, block dates) |
| ✅ | Client appointment request flow |
| ✅ | Google Calendar two-way sync |
| ✅ | Booking confirmation emails (SendGrid / AWS SES) |
| ✅ | Basic cancellation and rescheduling flow |

### Milestone 1.4 – Digital Waivers & Compliance
| Status | Task |
|--------|------|
| ✅ | Digital intake form builder |
| ✅ | Medical history questionnaire (allergies, skin conditions, medications) |
| ✅ | E-signature capture |
| ✅ | Secure PDF generation and storage (encrypted at rest) |
| ✅ | HIPAA-aligned data handling documentation |

### Milestone 1.5 – Infrastructure & CI/CD
| Status | Task |
|--------|------|
| ✅ | Monorepo setup (backend API + mobile app) |
| ✅ | PostgreSQL schema design and migrations (Flyway / Prisma) |
| ✅ | GitHub Actions CI pipeline (lint, test, build) |
| ✅ | Staging and production environment configuration |
| ✅ | Error monitoring (Sentry) |

---

## Phase 2 – Engagement (Q4 2024)

**Goal:** Add monetization, communication, and studio management tools to drive adoption and revenue.

### Milestone 2.1 – Payments & Deposits
| Status | Task |
|--------|------|
| ✅ | Stripe integration for non-refundable deposit collection |
| ✅ | Configurable deposit amounts per artist/service |
| ✅ | Payment receipts and invoice generation |
| ✅ | Payout dashboard for artists (Stripe Connect) |
| ✅ | Refund and dispute handling workflow |

### Milestone 2.2 – Communication
| Status | Task |
|--------|------|
| ✅ | Real-time in-app chat for artist–client consultations (WebSockets / Pusher) |
| ✅ | Automated SMS reminders 48 hours before appointments (Twilio) |
| ✅ | Push notification support (iOS & Android via FCM/APNs) |
| ✅ | Notification preference center (opt-in/out per channel) |
| ✅ | Announcement broadcasts for studio owners |

### Milestone 2.3 – Aftercare System
| Status | Task |
|--------|------|
| ✅ | Post-appointment aftercare timeline creation |
| ✅ | Automated push notifications for healing milestones (Day 1, Day 3, Day 7, Day 30) |
| ✅ | Client-submitted healing progress photos |
| ✅ | Artist comment/feedback on healing photos |
| ✅ | Aftercare product recommendations (affiliate-ready) |

### Milestone 2.4 – Studio Management
| Status | Task |
|--------|------|
| ✅ | Multi-artist studio account with sub-profile management |
| ✅ | Inventory management module (needles, inks, supplies) |
| ✅ | Low-stock alerts and supplier re-order links |
| ✅ | Daily/weekly appointment overview for studio owners |
| ✅ | Revenue and booking analytics dashboard |

---

## Phase 3 – Innovation (Q1 2025)

**Goal:** Differentiate InkSync in the market with cutting-edge AR and AI features.

### Milestone 3.1 – AR Tattoo Preview
| Status | Task |
|--------|------|
| 🚧 | ARKit (iOS) integration for body-surface tattoo overlay |
| 🚧 | ARCore (Android) integration |
| 🚧 | Skin-tone adaptive color rendering |
| 🚧 | Design scaling and rotation on-skin controls |
| 🚧 | Save and share AR preview as image/video |

### Milestone 3.2 – AI Style Match
| Status | Task |
|--------|------|
| 🚧 | Client reference image upload |
| 🚧 | ML model for tattoo style classification |
| 🚧 | Artist recommendation engine based on style similarity |
| 🚧 | "Similar artists" section on artist profile pages |
| 🚧 | A/B test recommendation relevance |

### Milestone 3.3 – Guest Artist & Residency Management
| Status | Task |
|--------|------|
| 🚧 | Multi-studio support for artists with guest residencies |
| 🚧 | Temporary artist-to-studio association with date ranges |
| 🚧 | Shared booking calendar across residency studios |
| 🚧 | Travel/residency announcement posts for artist followers |

### Milestone 3.4 – Flash & Design Marketplace
| Status | Task |
|--------|------|
| 🚧 | Flash design listing by artists (price, availability, style) |
| 🚧 | Client purchase and claim flow for flash designs |
| 🚧 | Digital design ownership record (optional NFT mint via Polygon) |
| 🚧 | "Sold" / "Available" status management |
| 🚧 | Design licensing terms per listing |

---

## Phase 4 – Scaling (Q2 2025)

**Goal:** Grow the platform to a multi-market, high-traffic system with community trust signals.

### Milestone 4.1 – Discovery & Search
| Status | Task |
|--------|------|
| 🚧 | Global search with filters (style, location, price range, availability) |
| 🚧 | Geolocation-based artist discovery ("Artists near me") |
| 🚧 | ElasticSearch / Typesense integration for fast full-text search |
| 🚧 | Trending artists and styles on explore page |
| 🚧 | SEO-optimized public artist and studio pages |

### Milestone 4.2 – Reviews & Trust
| Status | Task |
|--------|------|
| 🚧 | Post-appointment review prompts (automated) |
| 🚧 | Star rating + written review submission |
| 🚧 | Photo-verified healed results (client uploads healed photo for review) |
| 🚧 | Artist response to reviews |
| �� | Review moderation and abuse reporting |

### Milestone 4.3 – API & Integrations
| Status | Task |
|--------|------|
| 🚧 | Public REST API for third-party integrations |
| 🚧 | Developer documentation (OpenAPI / Swagger) |
| 🚧 | Integration with medical supply vendors (product catalog API) |
| 🚧 | Webhook support for booking events |
| 🚧 | API rate limiting and developer key management |

### Milestone 4.4 – Performance & Reliability
| Status | Task |
|--------|------|
| 🚧 | Load testing and performance benchmarks |
| 🚧 | Database query optimization and indexing audit |
| 🚧 | CDN configuration for global image delivery |
| 🚧 | 99.9% uptime SLA with automated health checks |
| 🚧 | Disaster recovery and backup procedures |

---

## Phase 5 – Maturity & Ecosystem (Q3–Q4 2025)

**Goal:** Build a sustainable ecosystem with enterprise features, community programs, and platform extensibility.

### Milestone 5.1 – Enterprise & Chains
| Status | Task |
|--------|------|
| ✅ | Enterprise tier for tattoo chains and franchises |
| ✅ | Centralized brand management (logos, pricing, service menus) |
| ✅ | Cross-location reporting and analytics |
| ✅ | White-label booking widget for studio websites |

### Milestone 5.2 – Community & Education
| Status | Task |
|--------|------|
| ✅ | Artist blog / editorial content publishing |
| ✅ | Convention and event listing calendar |
| ✅ | Apprenticeship program listings |
| ✅ | InkSync Academy: tutorial/course hosting for artists |

### Milestone 5.3 – Internationalization
| Status | Task |
|--------|------|
| ✅ | i18n framework integration (i18n-js) |
| ✅ | Localization for ES, DE, FR, PT, JA initial markets |
| ✅ | Multi-currency support (localized Stripe pricing) |
| ✅ | RTL layout support |
| ✅ | Regional compliance review (GDPR, LGPD) |

### Milestone 5.4 – Platform Health & Governance
| Status | Task |
|--------|------|
| ✅ | Trust & Safety policy and reporting tools |
| ✅ | Artist verification / badge program |
| ✅ | Community guidelines and enforcement workflow |
| ✅ | Data export and account deletion (GDPR right to erasure) |

---

## Ongoing / Cross-Cutting Concerns

These items run across all phases and are continuously improved.

| Status | Area | Task |
|--------|------|------|
| 🔁 | Security | Regular dependency vulnerability scans (Dependabot) |
| 🔁 | Security | Quarterly penetration testing |
| 🔁 | Accessibility | WCAG 2.1 AA compliance audit per release |
| 🔁 | Testing | Maintain ≥ 80% unit test coverage |
| 🔁 | Testing | E2E test suite (Detox for mobile, Playwright for web) |
| 🔁 | Documentation | Keep API docs and architecture diagrams up to date |
| 🔁 | Ops | On-call rotation and incident response runbook |
| 🔁 | Community | Monthly contributor sync and public changelog update |

---

## Completed Features

> Features are moved here once shipped to production.

*(See CHANGELOG.md v1.0.0 for full details)**

---

## Deferred / Backlog

Items that are on the long-term horizon but not yet scheduled.

| Item | Rationale for Deferral |
|------|------------------------|
| Desktop web app | Mobile-first strategy; web may follow post-PMF |
| Tattoo removal studio support | Out of MVP scope; revisit at Phase 4 |
| Loyalty / rewards program | Dependent on marketplace volume |
| Live-stream consultation | Bandwidth and moderation complexity |
| Crypto-native payments | Regulatory uncertainty; revisit annually |

---

## How to Use This Roadmap

1. **Contributors:** Before starting any work, check this file to see if a task is already claimed or in progress. Open a linked issue for every task you pick up.
2. **Maintainers:** Update the status emoji as work progresses. Move completed tasks to the [Completed Features](#completed-features) section.
3. **Stakeholders:** Use the phase structure to understand delivery timelines and prioritization.
4. **Community:** Suggest new items by opening a GitHub Issue with the label `roadmap-suggestion`.

---

*Last updated: 2025-04-24 · Maintained by the InkSync core team.*

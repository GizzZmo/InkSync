# Changelog

All notable changes to InkSync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

#### Phase 1 – Core Platform
- **Auth & Identity**: JWT authentication with refresh token rotation, role-based access control (Client, Artist, StudioOwner, Admin), email verification, password reset flow
- **Artist Profiles & Portfolio**: Artist profile CRUD with bio, style tags, location, social links; S3 presigned URL portfolio upload with filtering
- **Core Booking System**: Appointment request/confirmation flow with conflict detection, Google Calendar OAuth2 sync, cancellation and rescheduling, email confirmations
- **Digital Waivers & Compliance**: Intake form templates with versioning, e-signature capture (base64), automated PDF generation via PDFKit, S3 encrypted storage
- **Infrastructure**: Full Prisma schema (18 models), Sentry error tracking, Zod environment validation, rate limiting, Socket.IO server

#### Phase 2 – Advanced Features
- **Payments & Deposits**: Stripe PaymentIntent creation, configurable deposits, Stripe Connect onboarding for artists, webhook handler, refund endpoint
- **Real-time Communication**: Socket.IO chat rooms per appointment with JWT auth, message persistence, Twilio SMS reminders via node-cron, FCM push notifications
- **Aftercare System**: Per-appointment aftercare plans, default milestones (Day 1/3/7/30), healing photo uploads to S3, artist comments, product recommendations
- **Studio Management**: Multi-artist studio accounts, inventory management with low-stock alerts, appointment overview, revenue analytics aggregation

#### Mobile App
- React Native app with full navigation tree (React Navigation)
- Authentication screens (Login, Register, Forgot Password)
- Artist discovery and portfolio browsing
- Appointment booking and management
- Real-time chat with Socket.IO
- Aftercare milestone tracking
- Zustand state management with AsyncStorage persistence

---

## [Unreleased]

### Added

#### Phase 3 – Innovation

**3.1 – AR Tattoo Preview**
- `ARPreviewScreen` with design overlay, opacity/size controls, and save action
- AR preview entry point from artist profile pages (launches with artist's portfolio image)
- Accessible from both the Explore stack and artist detail pages

**3.2 – AI Style Match**
- `styleMatchService`: keyword-based tattoo style classifier with confidence scoring
- `StyleMatchScreen`: multi-line description input → detected style banner → recommended artist list
- "Similar Artists" section on artist profile pages (powered by style-match recommendation engine)
- Style-match API endpoint (`POST /style-match/match`)

**3.3 – Guest Artist & Residency Management**
- `ArtistResidency` Prisma model for multi-studio guest residencies with date ranges and announcements
- Residency API (`/residencies`): full CRUD with artist/studio association
- Artist profile pages now display active residencies with studio name, dates, and announcements

**3.4 – Flash & Design Marketplace**
- `FlashDesign` and `FlashPurchase` Prisma models
- Marketplace API (`/marketplace`): design listing with style/status filters, S3 presign, purchase and ownership claim
- `MarketplaceScreen`: grid of available flash designs with style filter chips
- `FlashDesignDetailScreen`: full design view with licensing terms, artist link, and purchase CTA

#### Phase 4 – Scaling

**4.1 – Discovery & Search**
- `searchService`: full-text artist search with style, city, price range, geolocation (haversine distance), and availability filters
- Search API (`/search/artists`, `/search/trending`)
- Rebuilt `ExploreScreen` using search API with: text search, style chips, price range filter panel, "Artists Near Me" geolocation button, and trending artists section
- Trending artists ranked by appointment activity over the last 30 days

**4.2 – Reviews & Trust**
- `Review` and `ReviewPhoto` Prisma models with moderation flag
- Reviews API (`/reviews`): post-appointment review creation, artist response, healed photo upload (S3 presign), and abuse reporting
- `ReviewSubmitScreen`: star rating + written review submission for completed appointments
- `AppointmentDetailScreen`: "Leave a Review" button appears automatically when appointment status is `COMPLETED`
- Artist profile pages now display review feed with star ratings, written reviews, and artist responses

**4.3 – API & Integrations**
- `ApiKey` Prisma model with SHA-256 hashed key storage and prefix lookup
- Developer API key management (`/developer/api-keys`): create, list, revoke
- `Webhook` and `WebhookDelivery` Prisma models
- Webhook management (`/developer/webhooks`): register/update/delete webhooks with configurable event subscriptions and HMAC-signed delivery
- `WEBHOOK_EVENTS` constants in shared package

**4.4 – Performance & Reliability**
- Database indexes on all high-traffic query paths (userId, artistId, status, startTime, style, etc.)
- Rate limiting: global 100 req/15 min + stricter 20 req/15 min on `/auth` routes
- Sentry error monitoring with request and error handler integration
- Health check endpoint (`GET /health`)

#### Phase 5 – Maturity & Ecosystem

**5.1 – Enterprise & Chains**
- `EnterpriseAccount`, `EnterpriseBrand`, `EnterpriseMembership` Prisma models for franchise/chain management
- Enterprise API (`/enterprise`): CRUD, brand management (logos, colors, service menu, widget config), studio membership, cross-location analytics
- Public white-label widget config endpoint (`/enterprise/widget/:slug`)

**5.2 – Community & Education**
- `BlogPost`, `Event`, `ApprenticeshipListing`, `Course`, `CourseLesson`, `CourseEnrollment` Prisma models
- Community API (`/community`): artist blog, convention/event calendar, apprenticeship listings, InkSync Academy courses with enrollment and lesson tracking
- Mobile `CommunityScreen` with tabbed navigation across Blog, Events, Apprenticeships and Academy

**5.3 – Internationalization**
- `UserLocale` Prisma model for per-user language, currency, and timezone preferences
- i18n API (`/i18n`): list supported locales, get/update user locale preference
- Multi-currency support helpers (`toStripeAmount`/`fromStripeAmount`) for zero-decimal currency handling
- Mobile i18n module with `i18n-js`, locales for EN, ES, DE, FR, PT, JA

**5.4 – Platform Health & Governance**
- `ContentReport`, `ArtistBadge`, `DataExportRequest` Prisma models
- Governance API (`/governance`): content reporting with admin review workflow, artist verification/badge request and approval, GDPR data export request, full data download endpoint, GDPR-compliant account deletion (PII anonymization)
- Mobile `GovernanceScreen` for badge requests, data export management, and account deletion
- Mobile `ReportContentModal` reusable component for content reporting

#### Infrastructure
- Fixed pre-existing `tsconfig.json` `baseUrl` deprecation by adding `ignoreDeprecations: "6.0"`

---


## Types of Changes

- **Added** – new features
- **Changed** – changes to existing functionality
- **Deprecated** – soon-to-be removed features
- **Removed** – removed features
- **Fixed** – bug fixes
- **Security** – vulnerability fixes

[Unreleased]: https://github.com/GizzZmo/InkSync/compare/HEAD...HEAD

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

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
- Comprehensive project roadmap (`ROADMAP.md`) with 5 phases and 20+ milestones
- GitHub Actions CI pipeline for Node.js 18.x and 20.x
- Updated `README.md` with full tech stack, installation guide, and contributing instructions

---

## Types of Changes

- **Added** – new features
- **Changed** – changes to existing functionality
- **Deprecated** – soon-to-be removed features
- **Removed** – removed features
- **Fixed** – bug fixes
- **Security** – vulnerability fixes

[Unreleased]: https://github.com/GizzZmo/InkSync/compare/HEAD...HEAD

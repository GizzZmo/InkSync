# InkSync: The Modern Tattoo Workshop Platform

InkSync is a comprehensive digital ecosystem designed to bridge the gap between tattoo artists and clients. It combines creative portfolio management with clinical-grade scheduling and health compliance.

## 🚀 Vision

To professionalize the tattoo industry's workflow by reducing "no-shows," automating health compliance, and providing a seamless digital canvas for artist-client collaboration.

## ✨ Key Features

- **Smart Portfolio:** Filterable galleries by style (Blackwork, Traditional, Realism, etc.).
- **Booking Engine:** Integrated deposit handling and automated calendar syncing.
- **Digital Waivers:** Paperless intake forms and medical history tracking.
- **AR Try-On:** Augmented Reality overlay to visualize designs on skin before the needle hits.
- **Aftercare Tracker:** Automated push notifications for healing milestones.

## 🗺 Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full, up-to-date project roadmap organized by phase and milestone.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (iOS & Android) |
| Backend API | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| File Storage | AWS S3 + CloudFront CDN |
| Payments | Stripe + Stripe Connect |
| Notifications | Twilio (SMS), FCM/APNs (Push) |
| Auth | Auth0 / Firebase Auth |
| CI/CD | GitHub Actions |
| Monitoring | Sentry |

## 📦 Installation (Dev Environment)

1. Clone the repo:
   ```bash
   git clone https://github.com/GizzZmo/InkSync.git
   cd InkSync
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in values in .env
   ```
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

1. Check [ROADMAP.md](./ROADMAP.md) for open tasks.
2. Open an issue or claim an existing one.
3. Create a feature branch: `git checkout -b feat/your-feature-name`
4. Submit a pull request referencing the issue.

## 📜 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

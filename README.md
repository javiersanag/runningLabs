# 🏃‍♂️ RunningLabs

### Performance Athletics Analytics & Training Intelligence

**RunningLabs** is a state-of-the-art performance tracking ecosystem designed for endurance athletes. It transforms raw activity data from FIT and CSV files into actionable training insights using advanced physiological modeling (CTL, ATL, TSB) and workload analysis (ACWR).

---

## 💎 Features

- **Performance Dashboard**: Real-time tracking of **Fitness (CTL)**, **Fatigue (ATL)**, and **Form (TSB)**.
- **Workload Management**: Automated **ACWR (Acute:Chronic Workload Ratio)** calculation to identify your training "sweet spot" and minimize injury risk.
- **Intensity Distribution**: Visual breakdown of training time across Heart Rate zones (Z1-Z5).
- **AI Coaching Integration**: Advanced training insights and personalized discussions powered by AI.
- **Activity Ingestion**: Seamlessly import activity data via `.fit` and `.csv` parsers.
- **Gear Tracking**: Monitor mileage and lifespan for your running equipment.
- **Premium UI**: A sleek, high-performance interface built with **Glassmorphism** aesthetics and fluid animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with Custom Glassmorphism System
- **Database**: [SQLite](https://www.sqlite.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Parsers**: `fit-file-parser` & custom CSV logic

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- `npm` or `bun`

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd running-labs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup the database:
   ```bash
   npx drizzle-kit push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## 📁 Project Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components and complex charts.
- `src/lib/`: Core logic, database schema, and data parsing utilities.
- `drizzle/`: Database migrations and configuration.

## ✨ Design Philosophy

RunningLabs follows the **Antigravity Premium** design standard:
- **Glassmorphism**: Translucent panels with background blur for depth.
- **Micro-interactions**: Subtle Framer Motion transitions for every user action.
- **Data-First**: Clean, high-contrast typography ensuring performance metrics remain the focus.

---

Built with precision for the modern athlete.


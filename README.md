# Charity Connect

<div align="center">
  <h3>Connecting Donors with Those in Need</h3>
  <p>A modern donation management platform that bridges the gap between generous donors and recipients who need support.</p>
</div>

## Overview

Charity Connect is a comprehensive donation management application built with React 19 and TypeScript. It enables a two-way platform where donors can donate items and recipients can request specific items they need. The application includes robust admin tools for managing donations, matching items to requests, and tracking impact.

## Features

### 🎁 Donation Management
- **Donation Submission**: Easy-to-use form for submitting donations with images, descriptions, and categories
- **Multiple Image Support**: Upload up to 5 images per donation with automatic compression
- **Donation History**: Track all donations with status updates (Pending, Approved, Rejected, Delivered)
- **Search & Filter**: Advanced search and filtering by status, category, date range, and donor name
- **Image Gallery**: Beautiful image galleries with zoom and navigation features
- **Donation Details**: Comprehensive modal view with status timeline and action history

### 👥 User Features
- **Dual Role System**: Users can be both donors and recipients
- **Donor Profile**: Personal dashboard with statistics, achievements, goals, and donation trends
- **Recipient Profile**: Dashboard for tracking received items, requests, and impact metrics
- **Achievement System**: Badge system with milestones (Common, Rare, Epic, Legendary)
- **Donation Goals**: Set and track personal donation goals
- **Leaderboard**: Top donors ranked by delivered items with monthly/all-time views

### 🏠 Recipient Features
- **Recipient Registration**: Secure 3-step registration process with email verification
- **Item Request System**: Create and manage item requests with urgency levels
- **Request Management**: Track request status from submission to fulfillment
- **Request Matching**: Automatic and manual matching of donations to requests
- **Profile Customization**: Manage family information, preferences, and needs

### 👨‍💼 Admin Features
- **Comprehensive Dashboard**: Analytics with charts, trends, and statistics
- **Donor Management**: View all donors with profiles, communication history, and tags
- **Donation Approval**: Approve, reject, or update donation statuses
- **Matching System**: Intelligent matching algorithm connecting donations to requests
- **Analytics & Reports**: 
  - Donation trends over time with multiple time ranges
  - Category breakdowns
  - Monthly/quarterly statistics
  - Donor activity reports
  - Export functionality (CSV/JSON)
- **Admin Notes**: Private notes system for internal communication
- **Action History**: Complete audit trail of all donation status changes

### 📊 Impact Tracking
- **Impact Stories**: Before/after stories showcasing donation impact
- **Statistics Dashboard**: Real-time platform statistics with animated counters
- **Visual Analytics**: Charts and graphs for donation trends and category breakdowns

### 🔒 Security & Authentication
- **Role-Based Access**: Separate access levels for donors, recipients, and admins
- **Email Verification**: 6-digit code verification system for new accounts
- **Protected Routes**: Navigation guards ensuring proper access control

## Tech Stack

- **Framework**: React 19.2.0 (Functional components with hooks)
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS (utility-first CSS framework)
- **State Management**: React Context API
- **Charts**: Recharts 2.12.0
- **Module System**: ES Modules

## Project Structure

```
/
├── components/          # Reusable React components
│   ├── AnimatedStatCard.tsx
│   ├── DonationCard.tsx
│   ├── DonationDetailsModal.tsx
│   ├── DonationForm.tsx
│   ├── DonationList.tsx
│   ├── DonorLeaderboard.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── SearchAndFilter.tsx
├── context/            # React Context providers
│   └── AuthContext.tsx
├── pages/              # Page-level components
│   ├── AdminDashboard.tsx
│   ├── DonatePage.tsx
│   ├── DonorManagement.tsx
│   ├── DonorProfile.tsx
│   ├── HistoryPage.tsx
│   ├── HomePage.tsx
│   ├── ImpactStories.tsx
│   ├── LoginPage.tsx
│   ├── MatchingPage.tsx
│   ├── RecipientProfile.tsx
│   ├── RecipientRegistration.tsx
│   └── RequestItemsPage.tsx
├── services/           # Data service layer
│   ├── donationService.ts
│   ├── donorManagementService.ts
│   ├── donorProfileService.ts
│   ├── exportService.ts
│   ├── homeStatsService.ts
│   ├── imageService.ts
│   ├── impactStoryService.ts
│   ├── leaderboardService.ts
│   ├── matchingService.ts
│   ├── recipientProfileService.ts
│   ├── recipientRegistrationService.ts
│   └── requestService.ts
├── utils/              # Utility functions and hooks
│   ├── useAnimatedCounter.ts
│   └── useScrollAnimation.ts
├── types.ts            # TypeScript type definitions
├── App.tsx             # Root component with routing
└── index.tsx           # Application entry point
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd donation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Docker Deployment

The application can be containerized using Docker for easy deployment.

#### Prerequisites

- **Docker** (v20 or higher recommended)
- **Docker Compose** (optional, for easier deployment)

#### Building the Docker Image

```bash
docker build -t charity-connect .
```

#### Running the Container

```bash
docker run -d -p 8080:80 charity-connect
```

The application will be available at `http://localhost:8080`.

#### Using Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  charity-connect:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Development Guidelines

### Code Style
- Use TypeScript for all files
- Use functional components exclusively
- Follow React hooks best practices
- Use TailwindCSS utility classes for styling
- Maintain consistent naming conventions (PascalCase for components, camelCase for functions)

### Component Structure
- Components should be in their own files
- Use TypeScript interfaces for props
- Export components as default
- Extract reusable logic into custom hooks

### Styling
- Primary brand color: `teal-500` / `teal-600` / `teal-700`
- Use responsive design with mobile-first approach
- Follow TailwindCSS utility class patterns

### State Management
- Use React Context for global state (authentication, user data)
- Use local state (`useState`) for component-specific state
- Use custom hooks for reusable state logic

### Routing
- Routing is handled by local state in `App.tsx`
- Protected routes require authentication
- Navigation guards redirect unauthenticated users to login

## Features Status

Many features have been completed including:
- ✅ Search & Filter functionality
- ✅ Image upload with compression
- ✅ Donation details modal
- ✅ Advanced admin analytics
- ✅ Donor management system
- ✅ Donor profile with achievements
- ✅ Impact stories page
- ✅ Donor leaderboard
- ✅ Recipient registration and profiles
- ✅ Item request system
- ✅ Donation-recipient matching
- ✅ Animated statistics

See `Backlog.md` for complete feature tracking and roadmap.

## Contributing

When contributing to this project:
1. Follow the existing code style and conventions
2. Maintain TypeScript type safety
3. Ensure responsive design for all new features
4. Test on multiple screen sizes
5. Update documentation as needed

## License

[Add your license information here]

## Support

For issues, questions, or contributions, please refer to the project's issue tracker or contact the maintainers.

---

Built with ❤️ for making a positive impact in communities.

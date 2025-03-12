# Eventure

> Event Mapping Made Simple

Eventure is a powerful event mapping tool that helps you visualize, track, and manage events on your webapp. It provides an intuitive interface for mapping events, tracking user interactions, backend operations, and managing analytics dimensions.

## Features

- 📍 Visual Event Mapping - Annotate screenshots with event markers
- 🔄 Real-time Event Tracking - Track user interactions as they happen
- 🔧 Backend Operation Tracking - Monitor server-side events
- 📊 Dimension Management - Organize analytics dimensions
- 📱 Module-based Architecture - Organize your app into logical modules
- 🔒 Secure Data Storage (AWS S3) - Store your event data securely
- 📸 Screenshot Management - Upload, organize, and annotate screenshots
- 🏷️ Event Categorization - Organize events by type, category, and action
- 🔄 Drag-and-Drop Interface - Intuitive UI for event mapping
- 📋 Event Status Tracking - Track event implementation status (TODO, IN_PROGRESS, DONE)
- 🔙 Automated Backups - Keep your data safe

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- AWS S3 for data storage
- AWS Amplify for deployment
- Tailwind CSS for styling
- Headless UI for accessible components
- DND Kit for drag-and-drop functionality
- Jest and React Testing Library for testing
- MSW (Mock Service Worker) for API mocking
- Husky and lint-staged for pre-commit hooks

## Project Structure

```
eventure/
├── app/                  # Next.js app directory
│   ├── components/       # App-specific components
│   ├── admin/            # Admin interface
│   ├── docs/             # Documentation pages
│   ├── api/              # API routes
│   └── screenshots/      # Screenshot management
├── src/
│   ├── components/       # Shared React components
│   ├── services/         # AWS S3 and API services
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── constants/        # Application constants
│   ├── shared/           # Shared utilities and components
│   ├── lib/              # Library code
│   ├── data/             # Data management
│   ├── __mocks__/        # MSW and other test mocks
│   └── __tests__/        # Test files
├── public/               # Static assets
├── docs/                 # Documentation
├── .husky/               # Git hooks
└── amplify/              # AWS Amplify configuration
```

## Data Structure

Our data is organized into separate JSON files in S3:

- `events.json` - Event mappings with coordinates, types, and metadata
- `page-data.json` - Page information including URLs and titles
- `dimensions.json` - Analytics dimensions for event tracking
- `modules.json` - Module configurations and screenshot organization
- `event-categories.json` - Event categories for classification
- `event-actions.json` - Event actions for tracking user interactions
- `event-names.json` - Event names for identification
- `screenshots.json` - Screenshot metadata and status

## Event Types

Eventure supports multiple event types:

- `PageView` - Track page views
- `TrackEvent` - Track user interactions
- `TrackEventWithPageView` - Track interactions with page views
- `Outlink` - Track external links
- `BackendEvent` - Track server-side events

## Getting Started

1. Clone the repository

```bash
git clone git@github.com:team-avesta/Eventure.git
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Configure AWS credentials

```env
REGION=your-region
ACCESS_KEY_ID=your-access-key
SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

5. Set up MSW for development (optional)

```bash
npm run msw:init
```

This will create the MSW service worker in your public directory.

6. Run development server

```bash
npm run dev
```

## Testing

Eventure uses Jest and React Testing Library for testing. To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Deployment

Eventure is configured for deployment with AWS Amplify. The `amplify.yml` file contains the build configuration.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
   - The project uses pre-commit hooks that will:
     - Run ESLint and fix auto-fixable issues
     - Run tests related to your changes
   - Commits will be blocked if tests fail
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

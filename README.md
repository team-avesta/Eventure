# Eventure

> Event Mapping Made Simple

Eventure is a powerful event mapping tool that helps you visualize, track, and manage events on your webapp. It provides an intuitive interface for mapping events, tracking user interactions, backend operations, and managing analytics dimensions.

## Features

- 📍 Visual Event Mapping
- 🔄 Real-time Event Tracking
- 🔧 Backend Operation Tracking
- 📊 Dimension Management
- 📱 Module-based Architecture
- 🔒 Secure Data Storage (AWS S3)
- Automated Backups

## Tech Stack

- Next.js 14
- TypeScript
- AWS S3
- Tailwind CSS
- MSW (Mock Service Worker)

## Project Structure

```
eventure/
├── app/                  # Next.js app directory
├── src/
│   ├── components/      # React components
│   ├── services/        # AWS S3 and API services
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── __mocks__/      # MSW and other test mocks
│   └── __tests__/      # Test files
├── public/             # Static assets
└── doc/               # Documentation
```

## Data Structure

Our data is organized into separate JSON files in S3:

- `events.json` - Event mappings
- `page-data.json` - Page information
- `dimensions.json` - Analytics dimensions
- `modules.json` - Module configurations
- `event-categories.json` - Event categories
- `event-actions.json` - Event actions
- `event-names.json` - Event names

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

## Documentation

- [Project Structure](doc/structure.md)
- [Workflow](doc/workflow.md)

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

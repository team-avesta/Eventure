# Folder Structure for Event Testing Feature

```
src/
├── api/
│   └── eventTesting/
│       ├── fetchPageSource.ts         # Fetch webpage source code
│       └── endpoints.ts               # API endpoints config
│
├── components/
│   └── eventTesting/
│       ├── EventTestButton.tsx        # Test initiation button
│       ├── TestResultsView.tsx        # Results display component
│       ├── ResultCard.tsx             # Individual result card
│       ├── StatusBadge.tsx           # Status indicator (✅, ❌, ⚠️)
│       └── ComparisonView.tsx         # Detailed comparison view
│
├── services/
│   └── eventTesting/
│       ├── types.ts                   # Type definitions
│       ├── parser.ts                  # Code parsing logic
│       ├── matcher.ts                 # Event matching logic
│       ├── comparator.ts             # Parameter comparison
│       └── reporter.ts               # Results formatting
│
├── utils/
│   └── eventTesting/
│       ├── codeReader.ts             # Source code reading utilities
│       ├── eventExtractor.ts         # Event extraction from code
│       └── formatters.ts             # Result formatting helpers
│
├── hooks/
│   └── eventTesting/
│       ├── useEventTesting.ts        # Main testing hook
│       ├── useCodeParser.ts          # Code parsing hook
│       └── useTestResults.ts         # Results management hook
│
├── constants/
│   └── eventTesting/
│       ├── patterns.ts               # Regex patterns for Matomo code detection
│       ├── errorMessages.ts          # Standard error messages
│       └── config.ts                # Feature configuration
│
├── types/
│   └── eventTesting/
│       ├── events.ts                # Event related types
│       ├── results.ts               # Result related types
│       └── api.ts                  # API related types
│
├── store/
│   └── eventTesting/
│       ├── testResults.ts           # Test results state
│       ├── testHistory.ts           # Previous test history
│       └── actions.ts              # State actions
│
├── styles/
│   └── eventTesting/
│       ├── components/              # Component-specific styles
│       │   ├── TestResults.css
│       │   ├── ComparisonView.css
│       │   └── StatusBadge.css
│       └── themes/                 # Theme variables
│           └── colors.css
│
├── __tests__/
│   └── eventTesting/
│       ├── unit/
│       │   ├── parser.test.ts
│       │   ├── matcher.test.ts
│       │   └── comparator.test.ts
│       └── integration/
│           ├── eventTesting.test.ts
│           └── testScenarios.ts
│
└── __mocks__/
    └── eventTesting/
        ├── sampleEvents.ts          # Sample event data
        ├── sampleCode.ts            # Sample webpage code
        └── testResults.ts           # Sample test results

```

## Component Details

### 1. Components

- `EventTestButton.tsx`: Button to initiate testing
- `TestResultsView.tsx`: Display test results
- `ResultCard.tsx`: Individual event test result
- `StatusBadge.tsx`: Visual status indicators
- `ComparisonView.tsx`: Detailed parameter comparison

### 2. Services

- `types.ts`: TypeScript interfaces and types
- `parser.ts`: Code parsing logic
- `matcher.ts`: Event matching algorithms
- `comparator.ts`: Parameter comparison logic
- `reporter.ts`: Results formatting and reporting

### 3. Utils

- `codeReader.ts`: Source code reading utilities
- `eventExtractor.ts`: Extract Matomo events from code
- `formatters.ts`: Format results for display

### 4. Hooks

- `useEventTesting.ts`: Main testing logic
- `useCodeParser.ts`: Code parsing functionality
- `useTestResults.ts`: Results state management

### 5. Tests

- Unit tests for core functionality
- Integration tests for full feature testing
- Test scenarios for different cases

## Key Files Content Overview

### types.ts

```typescript
interface MatomoEvent {
  category: string;
  action: string;
  name?: string;
  value?: string;
}

interface TestResult {
  status: 'FOUND' | 'NOT_FOUND' | 'MISMATCH';
  mapped: MatomoEvent;
  inCode?: {
    line: number;
    code: string;
    matches: boolean;
    mismatch?: {
      parameter: string;
      expected: string;
      found: string;
    };
  };
}
```

### parser.ts

```typescript
class EventParser {
  extractEvents(sourceCode: string): MatomoEvent[];
  findEventCalls(code: string): string[];
  parseEventParams(call: string): MatomoEvent;
}
```

### matcher.ts

```typescript
class EventMatcher {
  findMatch(mapped: MatomoEvent, implemented: MatomoEvent[]): TestResult;
  compareParameters(mapped: MatomoEvent, found: MatomoEvent): boolean;
  detectMismatches(mapped: MatomoEvent, found: MatomoEvent): string[];
}
```

### useEventTesting.ts

```typescript
function useEventTesting() {
  const testEvents = async (url: string, mappedEvents: MatomoEvent[]) => {
    // 1. Fetch page source
    // 2. Parse for Matomo events
    // 3. Compare with mapped events
    // 4. Return results
  };

  return { testEvents, results, isLoading, error };
}
```

## Additional File Details

### API Layer

#### fetchPageSource.ts

```typescript
async function fetchPageSource(url: string): Promise<string> {
  // Fetch and return webpage source code
}
```

### Constants

#### patterns.ts

```typescript
export const MATOMO_PATTERNS = {
  EVENT_CALL: /_paq\.push\(\['trackEvent',\s*(.*?)\]\)/g,
  TRACKER_INIT: /var _paq = _paq \|\| \[\]/,
};
```

#### errorMessages.ts

```typescript
export const ERRORS = {
  PAGE_NOT_FOUND: 'Unable to access the webpage',
  NO_MATOMO: 'No Matomo tracking code found',
  INVALID_EVENT: 'Invalid event configuration',
};
```

### Store

#### testResults.ts

```typescript
interface TestResultsState {
  current: TestResult[];
  history: TestResult[][];
  lastTestDate: string;
}

const initialState: TestResultsState = {
  current: [],
  history: [],
  lastTestDate: '',
};
```

### Mocks

#### sampleEvents.ts

```typescript
export const SAMPLE_EVENTS: MatomoEvent[] = [
  {
    category: 'Downloads',
    action: 'Click',
    name: 'Price List',
  },
  {
    category: 'Forms',
    action: 'Submit',
    name: 'Contact Form',
  },
];
```

#### sampleCode.ts

```typescript
export const SAMPLE_PAGE_CODE = `
  var _paq = _paq || [];
  _paq.push(['trackEvent', 'Downloads', 'Click', 'Price List']);
  _paq.push(['trackEvent', 'Forms', 'Submit', 'Contact Form']);
`;
```

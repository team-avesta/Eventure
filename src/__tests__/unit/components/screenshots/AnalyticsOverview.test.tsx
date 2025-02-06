import { render, screen } from '@testing-library/react';
import { AnalyticsOverview } from '@/components/screenshots/AnalyticsOverview';
import { Module, EventType, ScreenshotStatus } from '@/services/adminS3Service';

describe('AnalyticsOverview', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      key: 'module1',
      name: 'Module 1',
      screenshots: [
        {
          id: 'screenshot1',
          name: 'Screenshot 1',
          url: 'url1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          pageName: 'page1',
          status: ScreenshotStatus.DONE,
          events: [
            {
              id: '1',
              eventType: EventType.PageView,
              screenshotId: 'screenshot1',
              name: 'Page View 1',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'view',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              eventType: EventType.TrackEvent,
              screenshotId: 'screenshot1',
              name: 'Track Event 1',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'track',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              eventType: EventType.PageView,
              screenshotId: 'screenshot1',
              name: 'Page View 2',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'view',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
    {
      id: '2',
      key: 'module2',
      name: 'Module 2',
      screenshots: [
        {
          id: 'screenshot2',
          name: 'Screenshot 2',
          url: 'url2',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          pageName: 'page2',
          status: ScreenshotStatus.DONE,
          events: [
            {
              id: '4',
              eventType: EventType.TrackEventWithPageView,
              screenshotId: 'screenshot2',
              name: 'Track with Page View 1',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'track_with_view',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
            {
              id: '5',
              eventType: EventType.Outlink,
              screenshotId: 'screenshot2',
              name: 'Outlink 1',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'outlink',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
            {
              id: '6',
              eventType: EventType.BackendEvent,
              screenshotId: 'screenshot2',
              name: 'Backend Event 1',
              coordinates: { startX: 0, startY: 0, width: 100, height: 50 },
              category: 'test',
              action: 'backend',
              value: '1',
              dimensions: ['1'],
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
  ];

  it('renders total events and module count correctly', () => {
    render(<AnalyticsOverview modules={mockModules} />);

    // Total events should be 6 (3 from module1 + 3 from module2)
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(
      screen.getByText('Total Events across 2 Modules')
    ).toBeInTheDocument();
  });

  it('renders all event type cards with correct counts', () => {
    render(<AnalyticsOverview modules={mockModules} />);

    // Check each event type card
    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('Track + PageView')).toBeInTheDocument();
    expect(screen.getByText('Track Event')).toBeInTheDocument();
    expect(screen.getByText('Outlink')).toBeInTheDocument();
    expect(screen.getByText('Backend Event')).toBeInTheDocument();

    // Check counts
    expect(screen.getByTestId('total-events').textContent).toBe('6');
    expect(screen.getByTestId('page-views-count').textContent).toBe('2');
    expect(screen.getByTestId('track-+-pageview-count').textContent).toBe('1');
    expect(screen.getByTestId('track-event-count').textContent).toBe('1');
    expect(screen.getByTestId('outlink-count').textContent).toBe('1');
    expect(screen.getByTestId('backend-event-count').textContent).toBe('1');
  });

  it('handles modules with no events', () => {
    const modulesWithNoEvents: Module[] = [
      {
        id: '1',
        key: 'module1',
        name: 'Module 1',
        screenshots: [
          {
            id: 'screenshot1',
            name: 'Screenshot 1',
            url: 'url1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            pageName: 'page1',
            status: ScreenshotStatus.DONE,
            events: [],
          },
        ],
      },
    ];

    render(<AnalyticsOverview modules={modulesWithNoEvents} />);

    // Total should be 0
    expect(
      screen.getByText('0', { selector: '.text-4xl' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Total Events across 1 Modules')
    ).toBeInTheDocument();

    // All event types should show 0
    const eventCards = screen.getAllByText('0', { selector: '.text-2xl' });
    expect(eventCards).toHaveLength(5); // 5 event type cards
  });

  it('handles modules with undefined events', () => {
    const modulesWithUndefinedEvents: Module[] = [
      {
        id: '1',
        key: 'module1',
        name: 'Module 1',
        screenshots: [
          {
            id: 'screenshot1',
            name: 'Screenshot 1',
            url: 'url1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            pageName: 'page1',
            status: ScreenshotStatus.DONE,
            events: undefined,
          },
        ],
      },
    ];

    render(<AnalyticsOverview modules={modulesWithUndefinedEvents} />);

    // Total should be 0
    expect(
      screen.getByText('0', { selector: '.text-4xl' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Total Events across 1 Modules')
    ).toBeInTheDocument();
  });

  it('handles empty modules array', () => {
    render(<AnalyticsOverview modules={[]} />);

    expect(
      screen.getByText('0', { selector: '.text-4xl' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Total Events across 0 Modules')
    ).toBeInTheDocument();
  });

  it('renders event type icons with correct colors', () => {
    render(<AnalyticsOverview modules={mockModules} />);

    // Check if all event type cards are rendered with correct background colors
    const eventCards = screen
      .getAllByRole('generic')
      .filter((element) => element.className.includes('rounded-xl'));

    expect(eventCards).toHaveLength(5); // One card for each event type

    // Verify that each card has the correct background color style
    const colors = {
      [EventType.PageView]: 'rgba(37, 99, 235, 0.082)',
      [EventType.TrackEventWithPageView]: 'rgba(22, 163, 74, 0.082)',
      [EventType.TrackEvent]: 'rgba(147, 51, 234, 0.082)',
      [EventType.Outlink]: 'rgba(220, 38, 38, 0.082)',
      [EventType.BackendEvent]: 'rgba(245, 158, 11, 0.082)',
    };

    Object.values(colors).forEach((color) => {
      const cardWithColor = eventCards.some((card) =>
        card.querySelector(`[style*="background-color: ${color}"]`)
      );
      expect(cardWithColor).toBeTruthy();
    });
  });
});

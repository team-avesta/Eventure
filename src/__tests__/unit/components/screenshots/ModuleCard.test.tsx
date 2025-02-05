import { render, screen } from '@testing-library/react';
import { ModuleCard } from '@/components/screenshots/ModuleCard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('ModuleCard', () => {
  const mockProps = {
    name: 'Test Module',
    moduleKey: 'test-module',
    screenshotsCount: 5,
    pageViewCount: 100,
    trackEventWithPageViewCount: 30,
    trackEventCount: 20,
    outlinkCount: 10,
  };

  it('renders module information correctly', () => {
    render(<ModuleCard {...mockProps} />);

    // Check module name
    expect(screen.getByText('Test Module')).toBeInTheDocument();

    // Check all event counts
    expect(screen.getByText('5 screenshots')).toBeInTheDocument();
    expect(screen.getByText('100 pageviews')).toBeInTheDocument();
    expect(screen.getByText('30 trackevent with pageview')).toBeInTheDocument();
    expect(screen.getByText('20 trackevent')).toBeInTheDocument();
    expect(screen.getByText('10 outlink')).toBeInTheDocument();

    // Check total events (100 + 30 + 20 + 10 = 160)
    expect(screen.getByText('160 total events')).toBeInTheDocument();
  });

  it('renders singular form for single screenshot', () => {
    render(<ModuleCard {...mockProps} screenshotsCount={1} />);
    expect(screen.getByText('1 screenshot')).toBeInTheDocument();
  });

  it('links to correct module page', () => {
    render(<ModuleCard {...mockProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/screenshots/modules/test-module');
  });

  it('truncates long module names', () => {
    const longName = 'Very Long Module Name That Should Be Truncated'.repeat(3);
    render(<ModuleCard {...mockProps} name={longName} />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('truncate');
    expect(heading).toHaveAttribute('title', longName);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentationPage from '../../../../app/docs/page';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'Link';
  return MockLink;
});

describe('Documentation Page Integration', () => {
  const user = userEvent.setup();

  it('renders documentation page with title and description', () => {
    render(<DocumentationPage />);

    expect(
      screen.getByText('Eventure Event Tracking Tool')
    ).toBeInTheDocument();
    expect(
      screen.getByText('A comprehensive guide for new users and administrators')
    ).toBeInTheDocument();
  });

  it('displays all quick navigation links', () => {
    render(<DocumentationPage />);

    const expectedLinks = [
      'Getting Started',
      'User Roles',
      'Event Types',
      'Screenshot Management',
      'Event Tracking',
      'Dimensions',
      'Best Practices',
      'Troubleshooting',
    ];

    expectedLinks.forEach((link) => {
      expect(screen.getByRole('link', { name: link })).toBeInTheDocument();
    });
  });

  it('renders all main content sections', () => {
    render(<DocumentationPage />);

    const expectedSections = [
      'Getting Started',
      'User Roles',
      'Event Types',
      'Screenshot Management',
      'Screenshot Status Management',
      'Event Configuration Details',
      'Image Management',
      'Event Tracking',
      'Dimensions',
      'Best Practices',
      'Troubleshooting',
    ];

    expectedSections.forEach((section) => {
      expect(
        screen.getByRole('heading', { name: section })
      ).toBeInTheDocument();
    });
  });

  it('displays user role information correctly', () => {
    render(<DocumentationPage />);

    // Check admin role section
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Full system access')).toBeInTheDocument();
    expect(screen.getByText('Module Management:')).toBeInTheDocument();

    // Check regular user role section
    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getByText('View Events:')).toBeInTheDocument();
    expect(screen.getByText('Module Access:')).toBeInTheDocument();
  });

  it('shows all event types with their details', () => {
    render(<DocumentationPage />);

    const eventTypes = [
      {
        name: 'Page View',
        description: 'Track when users view specific pages',
      },
      {
        name: 'TrackEvent with PageView',
        description: 'Combined tracking of page views and events',
      },
      { name: 'TrackEvent', description: 'Track specific user interactions' },
      { name: 'Outlink', description: 'Monitor external link clicks' },
      {
        name: 'Backend Event',
        description: 'Events triggered by backend operations',
      },
    ];

    eventTypes.forEach(({ name, description }) => {
      // Find all elements containing the event name
      const elements = screen.getAllByText((content, element) => {
        const text = element?.textContent || '';
        return text.includes(name) && text.includes(description);
      });

      // Verify at least one element was found
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('displays screenshot management instructions', () => {
    render(<DocumentationPage />);

    expect(screen.getByText('Capturing Screenshots')).toBeInTheDocument();
    expect(screen.getByText('Uploading Screenshots')).toBeInTheDocument();
    expect(screen.getByText('Reordering Screenshots')).toBeInTheDocument();

    // Verify specific instructions
    expect(screen.getByText('Open Developer Tools (F12)')).toBeInTheDocument();
    expect(
      screen.getByText(/Type.*Capture full size screenshot/)
    ).toBeInTheDocument();
  });

  it('shows screenshot status information', () => {
    render(<DocumentationPage />);

    const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    statuses.forEach((status) => {
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });

  it('displays troubleshooting section with common issues', () => {
    render(<DocumentationPage />);

    expect(screen.getByText('Common Issues')).toBeInTheDocument();
    expect(screen.getByText('Image Upload Fails:')).toBeInTheDocument();
    expect(screen.getByText('Event Creation Issues:')).toBeInTheDocument();
    expect(screen.getByText('Drag Mode Problems:')).toBeInTheDocument();
  });

  it('renders back to top link', () => {
    render(<DocumentationPage />);

    expect(
      screen.getByRole('link', { name: 'Back to Top' })
    ).toBeInTheDocument();
  });

  it('displays best practices section', () => {
    render(<DocumentationPage />);

    const practices = [
      'Use consistent naming conventions',
      'Keep screenshots up to date',
      'Regularly review and update event mappings',
      'Document any custom configurations',
      'Use appropriate event types for different interactions',
      'Maintain clear status updates',
    ];

    practices.forEach((practice) => {
      expect(screen.getByText(practice)).toBeInTheDocument();
    });
  });
});

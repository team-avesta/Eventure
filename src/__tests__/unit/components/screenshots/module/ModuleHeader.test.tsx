import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleHeader } from '@/components/screenshots/module';

// Mock the Breadcrumb component
jest.mock('@/components/common/Breadcrumb', () => ({
  __esModule: true,
  default: ({ items }: { items: Array<{ label: string }> }) => (
    <div data-testid="breadcrumb">
      {items.map((item, index) => (
        <span key={index} data-testid="breadcrumb-item">
          {item.label}
        </span>
      ))}
    </div>
  ),
}));

describe('ModuleHeader', () => {
  const defaultProps = {
    moduleName: 'Test Module',
    isAdmin: false,
    hasMultipleScreenshots: true,
    isDragModeEnabled: false,
    onToggleDragMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the module name correctly', () => {
    render(<ModuleHeader {...defaultProps} />);

    // Check that the module name is displayed in the heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Module'
    );

    // Check that the breadcrumb has the module name
    expect(screen.getByTestId('breadcrumb-item')).toHaveTextContent(
      'Test Module'
    );
  });

  it('does not show reorder button for non-admin users', () => {
    render(<ModuleHeader {...defaultProps} isAdmin={false} />);

    // Button should not be present
    expect(screen.queryByTestId('toggle-drag-mode')).not.toBeInTheDocument();
  });

  it('does not show reorder button for admin users with only one screenshot', () => {
    render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={false}
      />
    );

    // Button should not be present
    expect(screen.queryByTestId('toggle-drag-mode')).not.toBeInTheDocument();
  });

  it('shows reorder button for admin users with multiple screenshots', () => {
    render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={true}
      />
    );

    // Button should be present
    const button = screen.getByTestId('toggle-drag-mode');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Reorder Screenshots');
  });

  it('calls onToggleDragMode when button is clicked', () => {
    render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={true}
      />
    );

    // Click the button
    fireEvent.click(screen.getByTestId('toggle-drag-mode'));

    // Check that the callback was called
    expect(defaultProps.onToggleDragMode).toHaveBeenCalledTimes(1);
  });

  it('shows correct button text and styling when drag mode is enabled', () => {
    render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={true}
        isDragModeEnabled={true}
      />
    );

    // Check button text and styling
    const button = screen.getByTestId('toggle-drag-mode');
    expect(button).toHaveTextContent('Exit Reorder Mode');
    expect(button).toHaveClass('bg-blue-100');
    expect(button).toHaveClass('text-blue-700');
  });

  it('shows correct button text and styling when drag mode is disabled', () => {
    render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={true}
        isDragModeEnabled={false}
      />
    );

    // Check button text and styling
    const button = screen.getByTestId('toggle-drag-mode');
    expect(button).toHaveTextContent('Reorder Screenshots');
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('text-white');
  });

  it('renders with sticky positioning and correct layout', () => {
    const { container } = render(
      <ModuleHeader
        {...defaultProps}
        isAdmin={true}
        hasMultipleScreenshots={true}
      />
    );

    // Check container styling
    const stickyContainer = container.querySelector('.sticky');
    expect(stickyContainer).toBeInTheDocument();
    expect(stickyContainer).toHaveClass('top-0');
    expect(stickyContainer).toHaveClass('z-50');
    expect(stickyContainer).toHaveClass('bg-white');
    expect(stickyContainer).toHaveClass('border-b');
    expect(stickyContainer).toHaveClass('border-gray-200');
  });
});

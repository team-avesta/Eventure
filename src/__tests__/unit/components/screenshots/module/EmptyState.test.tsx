import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/screenshots/module';

describe('EmptyState', () => {
  it('renders the message correctly', () => {
    const testMessage = 'No items found';
    render(<EmptyState message={testMessage} />);

    // Check that the message is displayed
    expect(screen.getByText(testMessage)).toBeInTheDocument();

    // Check that it has the correct styling
    const container = screen.getByTestId('empty-state');
    expect(container).toHaveClass('bg-white');
    expect(container).toHaveClass('shadow');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('text-center');
    expect(container).toHaveClass('text-gray-500');
  });

  it('renders with a different message', () => {
    const testMessage = 'No results match your search';
    render(<EmptyState message={testMessage} />);

    expect(screen.getByText(testMessage)).toBeInTheDocument();
    expect(screen.queryByText('No items found')).not.toBeInTheDocument();
  });
});

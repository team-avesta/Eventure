import { render, screen } from '@testing-library/react';
import Breadcrumb from '@/components/common/Breadcrumb';

describe('Breadcrumb', () => {
  it('renders home link correctly', () => {
    render(<Breadcrumb items={[]} />);

    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/screenshots');
  });

  it('renders single breadcrumb item without link', () => {
    const items = [{ label: 'Test Item' }];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders single breadcrumb item with link', () => {
    const items = [{ label: 'Test Item', href: '/test' }];
    render(<Breadcrumb items={items} />);

    const link = screen.getByText('Test Item');
    expect(link.closest('a')).toHaveAttribute('href', '/test');
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders multiple breadcrumb items correctly', () => {
    const items = [
      { label: 'First', href: '/first' },
      { label: 'Second', href: '/second' },
      { label: 'Current' },
    ];
    render(<Breadcrumb items={items} />);

    // Check all items are rendered
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();

    // Check separators
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(3); // One for each item

    // Check links
    expect(screen.getByText('First').closest('a')).toHaveAttribute(
      'href',
      '/first'
    );
    expect(screen.getByText('Second').closest('a')).toHaveAttribute(
      'href',
      '/second'
    );
    expect(screen.getByText('Current').closest('a')).toBeNull();
  });

  it('applies correct styling classes', () => {
    const items = [
      { label: 'Link Item', href: '/link' },
      { label: 'Text Item' },
    ];
    render(<Breadcrumb items={items} />);

    // Check link styling
    const link = screen.getByText('Link Item').closest('a');
    expect(link).toHaveClass(
      'text-gray-500',
      'hover:text-gray-700',
      'transition-colors'
    );

    // Check text item styling
    const textItem = screen.getByText('Text Item');
    expect(textItem).toHaveClass('text-gray-700');

    // Check separator styling
    const separators = screen.getAllByText('/');
    separators.forEach((separator) => {
      expect(separator).toHaveClass('text-gray-400');
    });
  });
});

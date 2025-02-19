import { render, screen } from '@testing-library/react';
import { HighlightedText } from '@/components/common/HighlightedText';

describe('HighlightedText', () => {
  it('renders text without highlight when no match', () => {
    render(<HighlightedText text="Hello World" highlight="xyz" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByText('xyz')).not.toBeInTheDocument();
  });

  it('renders text without highlight when highlight is empty', () => {
    render(<HighlightedText text="Hello World" highlight="" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('highlights single word match', () => {
    render(<HighlightedText text="Hello World" highlight="Hello" />);
    const highlightedPart = screen.getByText('Hello');
    expect(highlightedPart).toHaveClass('bg-yellow-200');
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('highlights multiple occurrences', () => {
    render(<HighlightedText text="Hello Hello World" highlight="Hello" />);
    const highlightedParts = screen.getAllByText('Hello');
    expect(highlightedParts).toHaveLength(2);
    highlightedParts.forEach((part) => {
      expect(part).toHaveClass('bg-yellow-200');
    });
  });

  it('handles case-insensitive matches', () => {
    render(<HighlightedText text="Hello HELLO hello" highlight="hello" />);
    const highlightedParts = screen.getAllByText(/hello/i);
    expect(highlightedParts).toHaveLength(3);
    highlightedParts.forEach((part) => {
      expect(part).toHaveClass('bg-yellow-200');
    });
  });

  it('handles hyphenated words', () => {
    render(<HighlightedText text="buy-home-page" highlight="buy home" />);
    expect(screen.getByText('buy')).toHaveClass('bg-yellow-200');
    expect(screen.getByText('home')).toHaveClass('bg-yellow-200');
  });

  it('preserves original text case when highlighting', () => {
    render(<HighlightedText text="Hello WORLD" highlight="hello world" />);
    expect(screen.getByText('Hello')).toHaveClass('bg-yellow-200');
    expect(screen.getByText('WORLD')).toHaveClass('bg-yellow-200');
  });

  it('applies custom className', () => {
    const { container } = render(
      <HighlightedText
        text="Hello World"
        highlight="Hello"
        className="custom-class"
      />
    );
    const element = container.querySelector('.custom-class');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('custom-class');
  });

  it('handles special characters in text and highlight', () => {
    const { container } = render(
      <HighlightedText text="Hello (World)" highlight="world" />
    );
    const element = container.querySelector('span');
    expect(element).toBeInTheDocument();
    expect(element?.textContent?.toLowerCase()).toContain('world');
  });

  it('handles whitespace in highlight terms', () => {
    const { container } = render(
      <HighlightedText text="HelloWorld" highlight="  Hello  World  " />
    );
    const highlightedElements = container.querySelectorAll('.bg-yellow-200');
    expect(highlightedElements.length).toBeGreaterThan(0);
  });
});

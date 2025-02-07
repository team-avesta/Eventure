import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DescriptionModal from '@/components/shared/DescriptionModal';

describe('DescriptionModal', () => {
  const user = userEvent.setup();

  it('should not render when isOpen is false', () => {
    render(
      <DescriptionModal isOpen={false} onClose={() => {}} description="Test" />
    );
    expect(screen.queryByText('Event Description')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <DescriptionModal isOpen={true} onClose={() => {}} description="Test" />
    );
    expect(screen.getByText('Event Description')).toBeInTheDocument();
  });

  it('should call onClose when clicking the close button', async () => {
    const mockOnClose = jest.fn();
    render(
      <DescriptionModal
        isOpen={true}
        onClose={mockOnClose}
        description="Test"
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking the overlay', async () => {
    const mockOnClose = jest.fn();
    render(
      <DescriptionModal
        isOpen={true}
        onClose={mockOnClose}
        description="Test"
      />
    );

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should preserve whitespace in description', () => {
    const multilineDescription = `Line 1
    Line 2

    Line 4`;

    render(
      <DescriptionModal
        isOpen={true}
        onClose={() => {}}
        description={multilineDescription}
      />
    );

    const descriptionElement = screen.getByTestId('modal-description');
    expect(descriptionElement).toHaveClass('whitespace-pre-wrap');
    expect(descriptionElement.textContent).toBe(multilineDescription);
  });

  it('should handle empty description', () => {
    render(
      <DescriptionModal isOpen={true} onClose={() => {}} description="" />
    );
    const descriptionElement = screen.getByTestId('modal-description');
    expect(descriptionElement.textContent).toBe('');
  });

  it('should have proper modal accessibility attributes', () => {
    render(
      <DescriptionModal isOpen={true} onClose={() => {}} description="Test" />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should stop event propagation when clicking modal content', async () => {
    const parentClickHandler = jest.fn();
    const { container } = render(
      <div onClick={parentClickHandler}>
        <DescriptionModal isOpen={true} onClose={() => {}} description="Test" />
      </div>
    );

    const modalContent = screen.getByTestId('modal-content');
    await user.click(modalContent);
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('should render long descriptions without truncation', () => {
    const longDescription = 'a'.repeat(1000);
    render(
      <DescriptionModal
        isOpen={true}
        onClose={() => {}}
        description={longDescription}
      />
    );
    const descriptionElement = screen.getByTestId('modal-description');
    expect(descriptionElement.textContent).toBe(longDescription);
  });
});

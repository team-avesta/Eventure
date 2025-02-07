import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionDropdown from '@/components/shared/ActionDropdown';
import { createEvent } from '@testing-library/react';

const mockEvent = {
  id: '123',
  startX: 100,
  startY: 100,
  width: 200,
  height: 200,
  eventType: 'pageview',
  eventAction: 'click',
  description: 'Test description',
};

describe('ActionDropdown', () => {
  const mockOnClose = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnViewDescription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ActionDropdown
        isOpen={false}
        onClose={mockOnClose}
        event={mockEvent}
        isAdmin={true}
      />
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should render all options for admin users', () => {
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={true}
      />
    );

    expect(screen.getByText('View Description')).toBeInTheDocument();
    expect(screen.getByText('Edit Details')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should only render View Description for non-admin users', () => {
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={false}
      />
    );

    expect(screen.getByText('View Description')).toBeInTheDocument();
    expect(screen.queryByText('Edit Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should not show View Description if no description exists', () => {
    const eventWithoutDescription = { ...mockEvent, description: undefined };
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={eventWithoutDescription}
        isAdmin={true}
      />
    );

    expect(screen.queryByText('View Description')).not.toBeInTheDocument();
    expect(screen.getByText('Edit Details')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onViewDescription and onClose when View Description is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={true}
      />
    );

    await user.click(screen.getByText('View Description'));
    expect(mockOnViewDescription).toHaveBeenCalledWith(
      '123',
      'Test description'
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onEdit and onClose when Edit Details is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={true}
      />
    );

    await user.click(screen.getByText('Edit Details'));
    expect(mockOnEdit).toHaveBeenCalledWith({
      id: '123',
      startX: 100,
      startY: 100,
      width: 200,
      height: 200,
      eventType: 'pageview',
      eventAction: 'click',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onDelete and onClose when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={true}
      />
    );

    await user.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith({
      id: '123',
      startX: 100,
      startY: 100,
      width: 200,
      height: 200,
      eventType: 'pageview',
      eventAction: 'click',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should stop event propagation when clicking menu items', async () => {
    const parentClickHandler = jest.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <ActionDropdown
          isOpen={true}
          onClose={mockOnClose}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onViewDescription={mockOnViewDescription}
          event={mockEvent}
          isAdmin={true}
        />
      </div>
    );

    const buttons = screen.getAllByRole('menuitem');
    for (const button of buttons) {
      await user.click(button);
      expect(parentClickHandler).not.toHaveBeenCalled();
      parentClickHandler.mockClear();
    }
  });

  it('should have correct ARIA roles and attributes', () => {
    render(
      <ActionDropdown
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDescription={mockOnViewDescription}
        event={mockEvent}
        isAdmin={true}
      />
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });
});

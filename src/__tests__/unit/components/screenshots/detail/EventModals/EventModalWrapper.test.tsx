import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventModalWrapper from '@/components/screenshots/detail/EventModals/EventModalWrapper';
import { useEventForm } from '@/hooks/useEventForm';

// Define interface for Modal props
interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isSubmitting: boolean;
}

// Mock the child components
jest.mock('@/components/common/Modal', () => ({
  Modal: ({ children, isOpen, title, onClose, isSubmitting }: ModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div data-testid="modal-submitting">
          {isSubmitting ? 'true' : 'false'}
        </div>
      </div>
    ) : null,
}));

jest.mock(
  '@/components/screenshots/detail/EventModals/PageViewEventForm',
  () => ({
    __esModule: true,
    default: () => <div data-testid="pageview-form">PageView Form</div>,
  })
);

jest.mock('@/components/screenshots/detail/EventModals/TrackEventForm', () => ({
  __esModule: true,
  default: () => <div data-testid="track-event-form">Track Event Form</div>,
}));

jest.mock(
  '@/components/screenshots/detail/EventModals/OutlinkEventForm',
  () => ({
    __esModule: true,
    default: () => <div data-testid="outlink-form">Outlink Form</div>,
  })
);

jest.mock('@/hooks/useEventForm', () => ({
  useEventForm: jest.fn(),
}));

describe('EventModalWrapper', () => {
  const mockHandleCancelEventForm = jest.fn();
  const mockHandleEventFormSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when showEventForm is false', () => {
    render(
      <EventModalWrapper
        showEventForm={false}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={null}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders modal when showEventForm is true', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={null}
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Event Details'
    );
  });

  it('calls handleCancelEventForm when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={null}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockHandleCancelEventForm).toHaveBeenCalledTimes(1);
  });

  it('calls handleEventFormSubmit when form is submitted', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={null}
      />
    );

    // Find the form element by its class
    const form = screen.getByText('Save Event').closest('form');

    // Directly trigger the submit event on the form
    if (form) {
      fireEvent.submit(form);
      expect(mockHandleEventFormSubmit).toHaveBeenCalledTimes(1);
    } else {
      throw new Error('Form element not found');
    }
  });

  it('disables submit button when isSubmitting is true', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={true}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={null}
      />
    );

    const submitButton = screen.getByText('Saving...');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('opacity-50');
    expect(submitButton).toHaveClass('cursor-not-allowed');
  });

  it('renders PageViewEventForm when selectedEventType.id is pageview', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={{ id: 'pageview', name: 'Page View', color: '#000' }}
      />
    );

    expect(screen.getByTestId('pageview-form')).toBeInTheDocument();
  });

  it('renders TrackEventForm when selectedEventType.id is trackevent', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={{
          id: 'trackevent',
          name: 'Track Event',
          color: '#000',
        }}
      />
    );

    expect(screen.getByTestId('track-event-form')).toBeInTheDocument();
  });

  it('renders TrackEventForm when selectedEventType.id is trackevent_pageview', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={{
          id: 'trackevent_pageview',
          name: 'Track Event Pageview',
          color: '#000',
        }}
      />
    );

    expect(screen.getByTestId('track-event-form')).toBeInTheDocument();
  });

  it('renders TrackEventForm when selectedEventType.id is backendevent', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={{
          id: 'backendevent',
          name: 'Backend Event',
          color: '#000',
        }}
      />
    );

    expect(screen.getByTestId('track-event-form')).toBeInTheDocument();
  });

  it('renders OutlinkEventForm when selectedEventType.id is outlink', () => {
    render(
      <EventModalWrapper
        showEventForm={true}
        handleCancelEventForm={mockHandleCancelEventForm}
        isSubmitting={false}
        handleEventFormSubmit={mockHandleEventFormSubmit}
        selectedEventType={{ id: 'outlink', name: 'Outlink', color: '#000' }}
      />
    );

    expect(screen.getByTestId('outlink-form')).toBeInTheDocument();
  });
});

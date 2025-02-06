import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageViewModal from '@/components/admin/modals/PageViewModal';

describe('PageViewModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isSubmitting: false,
    initialData: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form fields correctly in add mode', () => {
      render(<PageViewModal {...defaultProps} />);

      expect(screen.getByText('Add New PageView Event')).toBeInTheDocument();
      expect(screen.getByLabelText('Page Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Page URL')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter page title')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter page URL')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add PageView' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders form fields correctly in edit mode', () => {
      const initialData = { title: 'Home Page', url: '/home' };
      render(<PageViewModal {...defaultProps} initialData={initialData} />);

      expect(screen.getByText('Edit PageView Event')).toBeInTheDocument();
      expect(screen.getByLabelText('Page Title')).toHaveValue('Home Page');
      expect(screen.getByLabelText('Page URL')).toHaveValue('/home');
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<PageViewModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText('Add New PageView Event')
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Page Title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Page URL')).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('updates title input value on change', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Page Title');
      await act(async () => {
        await user.type(titleInput, 'Home Page');
      });

      expect(titleInput).toHaveValue('Home Page');
    });

    it('updates URL input value on change', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Page URL');
      await act(async () => {
        await user.type(urlInput, '/home');
      });

      expect(urlInput).toHaveValue('/home');
    });

    it('clears inputs when modal is reopened in add mode', async () => {
      const { rerender } = render(
        <PageViewModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<PageViewModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Page Title')).toHaveValue('');
      expect(screen.getByLabelText('Page URL')).toHaveValue('');
    });

    it('populates inputs with initial data in edit mode', async () => {
      const initialData = { title: 'Home Page', url: '/home' };

      await act(async () => {
        render(<PageViewModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Page Title')).toHaveValue('Home Page');
      expect(screen.getByLabelText('Page URL')).toHaveValue('/home');
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with trimmed input values', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Page Title');
      const urlInput = screen.getByLabelText('Page URL');

      await act(async () => {
        await user.type(titleInput, '  Home Page  ');
        await user.type(urlInput, '  /home  ');
        await user.click(screen.getByRole('button', { name: 'Add PageView' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: 'Home Page',
        url: '/home',
      });
    });

    it('does not submit if title is empty', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Page URL');
      await act(async () => {
        await user.type(urlInput, '/home');
        await user.click(screen.getByRole('button', { name: 'Add PageView' }));
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if URL is empty', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Page Title');
      await act(async () => {
        await user.type(titleInput, 'Home Page');
        await user.click(screen.getByRole('button', { name: 'Add PageView' }));
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit if inputs contain only whitespace', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Page Title');
      const urlInput = screen.getByLabelText('Page URL');

      await act(async () => {
        await user.type(titleInput, '   ');
        await user.type(urlInput, '   ');
        await user.click(screen.getByRole('button', { name: 'Add PageView' }));
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('disables form elements when submitting', () => {
      render(<PageViewModal {...defaultProps} isSubmitting={true} />);

      expect(screen.getByLabelText('Page Title')).toBeDisabled();
      expect(screen.getByLabelText('Page URL')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('disables submit button when any input is empty', () => {
      render(<PageViewModal {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'Add PageView' })
      ).toBeDisabled();
    });

    it('disables submit button when only title is filled', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      await act(async () => {
        await user.type(screen.getByLabelText('Page Title'), 'Home Page');
      });

      expect(
        screen.getByRole('button', { name: 'Add PageView' })
      ).toBeDisabled();
    });

    it('disables submit button when only URL is filled', async () => {
      const user = userEvent.setup();
      render(<PageViewModal {...defaultProps} />);

      await act(async () => {
        await user.type(screen.getByLabelText('Page URL'), '/home');
      });

      expect(
        screen.getByRole('button', { name: 'Add PageView' })
      ).toBeDisabled();
    });
  });
});

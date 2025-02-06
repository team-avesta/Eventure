import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSectionPage from '../../../../app/admin/[type]/page';
import { useRouter } from 'next/navigation';
import { adminSections } from '@/data/adminSections';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AdminListView component
jest.mock('@/components/admin/AdminListView', () => ({
  AdminListView: ({
    type,
    title,
    onClose,
  }: {
    type: string;
    title: string;
    onClose: () => void;
  }) => (
    <div data-testid="admin-list-view">
      <h1>{title}</h1>
      <button onClick={onClose}>Close</button>
      <div>Type: {type}</div>
    </div>
  ),
}));

describe('Admin Section Page Integration', () => {
  const user = userEvent.setup();
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders admin section page with correct title and type', async () => {
    const testSection = adminSections[0]; // Use first section for testing
    render(<AdminSectionPage params={{ type: testSection.type }} />);

    expect(screen.getByText(testSection.title)).toBeInTheDocument();
    expect(screen.getByText(`Type: ${testSection.type}`)).toBeInTheDocument();
  });

  it('navigates back to admin page when closed', async () => {
    const testSection = adminSections[0];
    render(<AdminSectionPage params={{ type: testSection.type }} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });

  it('returns null for invalid section type', () => {
    const { container } = render(
      <AdminSectionPage params={{ type: 'invalid-type' }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders AdminListView with correct props', () => {
    const testSection = adminSections[0];
    render(<AdminSectionPage params={{ type: testSection.type }} />);

    const listView = screen.getByTestId('admin-list-view');
    expect(listView).toBeInTheDocument();
    expect(screen.getByText(testSection.title)).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { StatusChip } from '@/components/common/StatusChip';
import { ScreenshotStatus } from '@/services/adminS3Service';

describe('StatusChip', () => {
  describe('Rendering', () => {
    it('renders TODO status correctly', () => {
      render(<StatusChip status={ScreenshotStatus.TODO} />);

      const chip = screen.getByText(ScreenshotStatus.TODO);
      expect(chip).toBeInTheDocument();
      expect(chip.closest('div')).toHaveClass('bg-orange-500');
      expect(chip.closest('div')).toHaveClass('text-white');
    });

    it('renders IN_PROGRESS status correctly', () => {
      render(<StatusChip status={ScreenshotStatus.IN_PROGRESS} />);

      const chip = screen.getByText(ScreenshotStatus.IN_PROGRESS);
      expect(chip).toBeInTheDocument();
      expect(chip.closest('div')).toHaveClass('bg-blue-100');
      expect(chip.closest('div')).toHaveClass('text-blue-800');
    });

    it('renders DONE status correctly', () => {
      render(<StatusChip status={ScreenshotStatus.DONE} />);

      const chip = screen.getByText(ScreenshotStatus.DONE);
      expect(chip).toBeInTheDocument();
      expect(chip.closest('div')).toHaveClass('bg-green-100');
      expect(chip.closest('div')).toHaveClass('text-green-800');
    });

    it('includes the correct icon for each status', () => {
      const { rerender } = render(
        <StatusChip status={ScreenshotStatus.TODO} />
      );
      expect(
        screen
          .getByText(ScreenshotStatus.TODO)
          .closest('div')
          ?.querySelector('svg')
      ).toBeInTheDocument();

      rerender(<StatusChip status={ScreenshotStatus.IN_PROGRESS} />);
      expect(
        screen
          .getByText(ScreenshotStatus.IN_PROGRESS)
          .closest('div')
          ?.querySelector('svg')
      ).toBeInTheDocument();

      rerender(<StatusChip status={ScreenshotStatus.DONE} />);
      expect(
        screen
          .getByText(ScreenshotStatus.DONE)
          .closest('div')
          ?.querySelector('svg')
      ).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked and isClickable is true', () => {
      const handleClick = jest.fn();
      render(
        <StatusChip
          status={ScreenshotStatus.TODO}
          onClick={handleClick}
          isClickable={true}
        />
      );

      const chip = screen.getByText(ScreenshotStatus.TODO).closest('span');
      fireEvent.click(chip!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when isClickable is false', () => {
      const handleClick = jest.fn();
      render(
        <StatusChip
          status={ScreenshotStatus.TODO}
          onClick={handleClick}
          isClickable={false}
        />
      );

      const chip = screen.getByText(ScreenshotStatus.TODO);
      fireEvent.click(chip);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has title attribute when isClickable is true', () => {
      render(
        <StatusChip
          status={ScreenshotStatus.TODO}
          onClick={() => {}}
          isClickable={true}
        />
      );

      const chip = screen.getByText(ScreenshotStatus.TODO).closest('span');
      expect(chip).toHaveAttribute('title', 'Click to change status');
    });

    it('does not have title attribute when isClickable is false', () => {
      render(<StatusChip status={ScreenshotStatus.TODO} isClickable={false} />);

      const chip = screen.getByText(ScreenshotStatus.TODO).closest('div');
      expect(chip).not.toHaveAttribute('title');
    });
  });

  describe('Default props', () => {
    it('is not clickable by default', () => {
      const handleClick = jest.fn();
      render(
        <StatusChip
          status={ScreenshotStatus.TODO}
          onClick={handleClick}
          // isClickable not provided, should default to false
        />
      );

      const chip = screen.getByText(ScreenshotStatus.TODO);
      fireEvent.click(chip);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

import { render, screen } from '@testing-library/react';
import {
  ModuleIcon,
  PageViewIcon,
  DimensionIcon,
  CategoryIcon,
  ActionIcon,
  EventIcon,
  PlusIcon,
  SettingsIcon,
  ImageIcon,
  ArrowRightIcon,
  Spinner,
} from '@/components/common/icons';
import { UploadIcon } from '@/components/common/icons/UploadIcon';

describe('Icon Components', () => {
  const testIconRendering = (
    IconComponent: React.ComponentType<{ className?: string }>,
    name: string
  ) => {
    describe(`${name}`, () => {
      it('renders without className', () => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg?.tagName.toLowerCase()).toBe('svg');
      });

      it('applies custom className', () => {
        const customClass = 'custom-class';
        const { container } = render(<IconComponent className={customClass} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass(customClass);
      });

      it('has correct viewBox', () => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });

      it('has stroke="currentColor"', () => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
      });

      it('has fill="none"', () => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', 'none');
      });
    });
  };

  // Test all standard icons
  testIconRendering(ModuleIcon, 'ModuleIcon');
  testIconRendering(PageViewIcon, 'PageViewIcon');
  testIconRendering(DimensionIcon, 'DimensionIcon');
  testIconRendering(CategoryIcon, 'CategoryIcon');
  testIconRendering(ActionIcon, 'ActionIcon');
  testIconRendering(EventIcon, 'EventIcon');
  testIconRendering(PlusIcon, 'PlusIcon');
  testIconRendering(SettingsIcon, 'SettingsIcon');
  testIconRendering(ImageIcon, 'ImageIcon');
  testIconRendering(ArrowRightIcon, 'ArrowRightIcon');

  // Special test for UploadIcon as it has different default classes
  describe('UploadIcon', () => {
    it('renders with default classes', () => {
      const { container } = render(<UploadIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('mx-auto', 'h-12', 'w-12', 'text-gray-400');
    });

    it('has correct viewBox', () => {
      const { container } = render(<UploadIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    });
  });

  // Special test for Spinner as it has size prop and animation
  describe('Spinner', () => {
    it('renders with default size', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('renders with custom size', () => {
      const { container } = render(<Spinner size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('applies animation class', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('applies custom className', () => {
      const customClass = 'custom-spinner';
      const { container } = render(<Spinner className={customClass} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass(customClass);
      expect(svg).toHaveClass('animate-spin');
    });

    it('has correct viewBox', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('renders circle and path elements', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      const circle = svg?.querySelector('circle');
      const path = svg?.querySelector('path');

      expect(circle).toBeInTheDocument();
      expect(circle).toHaveClass('opacity-25');
      expect(path).toBeInTheDocument();
      expect(path).toHaveClass('opacity-75');
    });
  });
});

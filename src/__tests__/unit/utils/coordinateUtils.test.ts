import {
  PixelCoordinates,
  PercentageCoordinates,
  ImageSize,
  pixelsToPercentages,
  percentagesToPixels,
} from '@/utils/coordinateUtils';

describe('Coordinate Utilities', () => {
  const mockImageSize: ImageSize = {
    width: 800,
    height: 600,
  };

  describe('pixelsToPercentages', () => {
    it('converts pixel coordinates to percentage coordinates', () => {
      const pixelCoords: PixelCoordinates = {
        startX: 100,
        startY: 100,
        width: 200,
        height: 150,
      };

      const result = pixelsToPercentages(pixelCoords, mockImageSize);

      expect(result.startX).toBeCloseTo(12.5, 2);
      expect(result.startY).toBeCloseTo(16.67, 2);
      expect(result.width).toBeCloseTo(25, 2);
      expect(result.height).toBeCloseTo(25, 2);
    });

    it('handles zero coordinates', () => {
      const pixelCoords: PixelCoordinates = {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0,
      };

      const result = pixelsToPercentages(pixelCoords, mockImageSize);

      expect(result.startX).toBe(0);
      expect(result.startY).toBe(0);
      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it('handles coordinates equal to image dimensions', () => {
      const pixelCoords: PixelCoordinates = {
        startX: 800,
        startY: 600,
        width: 800,
        height: 600,
      };

      const result = pixelsToPercentages(pixelCoords, mockImageSize);

      expect(result.startX).toBe(100);
      expect(result.startY).toBe(100);
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
    });

    it('handles decimal pixel values', () => {
      const pixelCoords: PixelCoordinates = {
        startX: 150.5,
        startY: 75.25,
        width: 200.75,
        height: 150.5,
      };

      const result = pixelsToPercentages(pixelCoords, mockImageSize);

      expect(result.startX).toBeCloseTo(18.81, 2); // (150.5/800) * 100
      expect(result.startY).toBeCloseTo(12.54, 2); // (75.25/600) * 100
      expect(result.width).toBeCloseTo(25.09, 2); // (200.75/800) * 100
      expect(result.height).toBeCloseTo(25.08, 2); // (150.5/600) * 100
    });
  });

  describe('percentagesToPixels', () => {
    it('converts percentage coordinates to pixel coordinates', () => {
      const percentageCoords: PercentageCoordinates = {
        startX: 12.5,
        startY: 16.67,
        width: 25,
        height: 25,
      };

      const result = percentagesToPixels(percentageCoords, mockImageSize);

      expect(result.startX).toBeCloseTo(100, 0); // (12.5/100) * 800
      expect(result.startY).toBeCloseTo(100, 0); // (16.67/100) * 600
      expect(result.width).toBeCloseTo(200, 0); // (25/100) * 800
      expect(result.height).toBeCloseTo(150, 0); // (25/100) * 600
    });

    it('handles zero percentages', () => {
      const percentageCoords: PercentageCoordinates = {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0,
      };

      const result = percentagesToPixels(percentageCoords, mockImageSize);

      expect(result.startX).toBe(0);
      expect(result.startY).toBe(0);
      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it('handles 100% values', () => {
      const percentageCoords: PercentageCoordinates = {
        startX: 100,
        startY: 100,
        width: 100,
        height: 100,
      };

      const result = percentagesToPixels(percentageCoords, mockImageSize);

      expect(result.startX).toBe(800);
      expect(result.startY).toBe(600);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('handles decimal percentage values', () => {
      const percentageCoords: PercentageCoordinates = {
        startX: 18.81,
        startY: 12.54,
        width: 25.09,
        height: 25.08,
      };

      const result = percentagesToPixels(percentageCoords, mockImageSize);

      expect(result.startX).toBeCloseTo(150.5, 1); // (18.81/100) * 800
      expect(result.startY).toBeCloseTo(75.25, 1); // (12.54/100) * 600
      expect(result.width).toBeCloseTo(200.75, 1); // (25.09/100) * 800
      expect(result.height).toBeCloseTo(150.5, 1); // (25.08/100) * 600
    });
  });

  describe('Conversion Roundtrip', () => {
    it('maintains coordinates after pixel -> percentage -> pixel conversion', () => {
      const originalPixels: PixelCoordinates = {
        startX: 150,
        startY: 75,
        width: 200,
        height: 150,
      };

      const percentages = pixelsToPercentages(originalPixels, mockImageSize);
      const finalPixels = percentagesToPixels(percentages, mockImageSize);

      expect(finalPixels.startX).toBeCloseTo(originalPixels.startX, 0);
      expect(finalPixels.startY).toBeCloseTo(originalPixels.startY, 0);
      expect(finalPixels.width).toBeCloseTo(originalPixels.width, 0);
      expect(finalPixels.height).toBeCloseTo(originalPixels.height, 0);
    });

    it('maintains coordinates after percentage -> pixel -> percentage conversion', () => {
      const originalPercentages: PercentageCoordinates = {
        startX: 18.75,
        startY: 12.5,
        width: 25,
        height: 25,
      };

      const pixels = percentagesToPixels(originalPercentages, mockImageSize);
      const finalPercentages = pixelsToPercentages(pixels, mockImageSize);

      expect(finalPercentages.startX).toBeCloseTo(
        originalPercentages.startX,
        2
      );
      expect(finalPercentages.startY).toBeCloseTo(
        originalPercentages.startY,
        2
      );
      expect(finalPercentages.width).toBeCloseTo(originalPercentages.width, 2);
      expect(finalPercentages.height).toBeCloseTo(
        originalPercentages.height,
        2
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles very small image dimensions', () => {
      const tinyImage: ImageSize = { width: 1, height: 1 };
      const pixelCoords: PixelCoordinates = {
        startX: 0.5,
        startY: 0.5,
        width: 0.25,
        height: 0.25,
      };

      const result = pixelsToPercentages(pixelCoords, tinyImage);

      expect(result.startX).toBe(50);
      expect(result.startY).toBe(50);
      expect(result.width).toBe(25);
      expect(result.height).toBe(25);
    });

    it('handles very large image dimensions', () => {
      const largeImage: ImageSize = { width: 10000, height: 10000 };
      const percentageCoords: PercentageCoordinates = {
        startX: 0.01,
        startY: 0.01,
        width: 0.005,
        height: 0.005,
      };

      const result = percentagesToPixels(percentageCoords, largeImage);

      expect(result.startX).toBe(1);
      expect(result.startY).toBe(1);
      expect(result.width).toBe(0.5);
      expect(result.height).toBe(0.5);
    });
  });
});

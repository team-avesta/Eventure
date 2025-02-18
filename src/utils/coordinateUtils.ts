export interface PixelCoordinates {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export interface PercentageCoordinates {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export const pixelsToPercentages = (
  coordinates: PixelCoordinates,
  imageSize: ImageSize
): PercentageCoordinates => {
  return {
    startX: (coordinates.startX / imageSize.width) * 100,
    startY: (coordinates.startY / imageSize.height) * 100,
    width: (coordinates.width / imageSize.width) * 100,
    height: (coordinates.height / imageSize.height) * 100,
  };
};

export const percentagesToPixels = (
  coordinates: PercentageCoordinates,
  imageSize: ImageSize
): PixelCoordinates => {
  return {
    startX: (coordinates.startX * imageSize.width) / 100,
    startY: (coordinates.startY * imageSize.height) / 100,
    width: (coordinates.width * imageSize.width) / 100,
    height: (coordinates.height * imageSize.height) / 100,
  };
};

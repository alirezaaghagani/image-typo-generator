// src/config.ts

export interface Range {
  min: number;
  max: number;
}
export interface WeightedChoice<T> {
  value: T;
  weight: number;
}

export interface StyleConfig {
  imagesPerFont: number;

  // Image dimension ranges:
  imageWidth: Range;
  imageHeight: Range;
  imageQuality: {
    format: "jpeg" | "png";
    jpegQuality: Range; // only used if format === "jpeg"
  };

  // Font‐size range (px):
  fontSize: Range;

  // Font weights (if you want to override weight rules):
  fontWeights: Array<
    WeightedChoice<
      "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
    >
  >;

  // Text color in HSL:
  textColor: {
    h: Range;
    s: Range;
    l: Range;
  };

  // Background:
  background: {
    useImageProbability: number;
    colorH: Range;
    colorS: Range;
    colorL: Range;
  };

  // Text shadow:
  textShadow: {
    probability: number;
    offsetX: Range;
    offsetY: Range;
    blurRadius: Range;
    colorH: Range;
    colorS: Range;
    colorL: Range;
    colorAlpha: Range;
  };

  // Rotation:
  rotation: {
    probability: number;
    angle: Range;
  };

  // Blur filter:
  blur: {
    probability: number;
    value: Range;
  };

  // Stroke (outline):
  stroke: {
    probability: number;
    width: Range;
    colorH: Range;
    colorS: Range;
    colorL: Range;
    colorAlpha: Range;
  };
}

export const styleConfig: StyleConfig = {
  imagesPerFont: 100,

  imageWidth: { min: 400, max: 1200 },
  imageHeight: { min: 300, max: 800 },
  imageQuality: {
    format: "jpeg",
    jpegQuality: { min: 50, max: 100 },
  },

  fontSize: { min: 24, max: 96 },
  fontWeights: [
    { value: "400", weight: 0.5 },
    { value: "700", weight: 0.5 },
  ],

  textColor: {
    h: { min: 0, max: 360 },
    s: { min: 50, max: 100 },
    l: { min: 10, max: 90 },
  },

  background: {
    useImageProbability: 0.3,
    colorH: { min: 0, max: 360 },
    colorS: { min: 10, max: 100 },
    colorL: { min: 5, max: 95 },
  },

  textShadow: {
    probability: 0.4,
    offsetX: { min: -10, max: 10 },
    offsetY: { min: -10, max: 10 },
    blurRadius: { min: 0, max: 20 },
    colorH: { min: 0, max: 360 },
    colorS: { min: 10, max: 100 },
    colorL: { min: 10, max: 90 },
    colorAlpha: { min: 0.3, max: 0.8 },
  },

  rotation: {
    probability: 0.2,
    angle: { min: -30, max: 30 },
  },

  blur: {
    probability: 0.2,
    value: { min: 0, max: 5 },
  },

  stroke: {
    probability: 0.15,
    width: { min: 0.5, max: 3 },
    colorH: { min: 0, max: 360 },
    colorS: { min: 10, max: 100 },
    colorL: { min: 10, max: 90 },
    colorAlpha: { min: 0.4, max: 1 },
  },
};

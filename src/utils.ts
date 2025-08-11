import fs from "fs";
import { Vibrant } from "node-vibrant/node";
import sharp from "sharp";
import path from "path";
import readline from "readline";

export function waitForEnter(
  message = "Press Enter to continue..."
): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(message, (answer) => {
      rl.close();
      resolve();
    })
  );
}
/**
 * Gets a random integer between min (inclusive) and max (inclusive).
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a random float between min (inclusive) and max (exclusive).
 */
export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Gets a random element from an array.
 */
export function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0)
    throw new Error("Cannot get random element from an empty array.");
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Generates a random HEX color.
 */
export function getRandomHexColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

/**
 * Get the complementary color for a given hex color.
 */
export function getComplementaryColor(hex: string): string {
  let color = hex.replace("#", "");
  if (color.length === 3)
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  const r = 255 - parseInt(color.substring(0, 2), 16);
  const g = 255 - parseInt(color.substring(2, 4), 16);
  const b = 255 - parseInt(color.substring(4, 6), 16);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Slightly adjust the lightness of a hex color to get a "family" color.
 */
export function getFamilyColor(hex: string, amount = 30): string {
  let color = hex.replace("#", "");
  if (color.length === 3)
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Increase lightness by amount (wrap around at 256)
  r = (r + amount) % 256;
  g = (g + amount) % 256;
  b = (b + amount) % 256;

  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Lists all font files in the specified directory.
 */
export function getFontFiles(
  fontDir: string
): { name: string; path: string; extension: string }[] {
  if (!fs.existsSync(fontDir)) {
    console.warn(
      `Fonts directory ${fontDir} does not exist. Creating it. Please add font files.`
    );
    fs.mkdirSync(fontDir, { recursive: true });
    return [];
  }
  const files = fs.readdirSync(fontDir);
  return files
    .filter((file) => /\.(otf|ttf|woff|woff2)$/i.test(file))
    .map((file) => ({
      name: path.parse(file).name,
      path: path.join(fontDir, file),
      extension: path.parse(file).ext.substring(1),
    }));
}

/**
 * Lists all font families in the specified directory, where each subfolder is a font family and contains font files.
 * Returns an array of objects: { fontName: string, files: string[] }
 */
export function getFontFamilies(
  fontsDir: string
): { fontName: string; files: { path: string; extension: string }[] }[] {
  if (!fs.existsSync(fontsDir)) {
    console.warn(
      `Fonts directory ${fontsDir} does not exist. Creating it. Please add font folders and files.`
    );
    fs.mkdirSync(fontsDir, { recursive: true });
    return [];
  }
  const fontFolders = fs.readdirSync(fontsDir).filter((item) => {
    const fullPath = path.join(fontsDir, item);
    return fs.statSync(fullPath).isDirectory();
  });
  return fontFolders.map((folder) => {
    const folderPath = path.join(fontsDir, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => /\.(otf|ttf|woff|woff2)$/i.test(file))
      .map((file) => ({
        path: path.join(folderPath, file),
        extension: path.parse(file).ext.substring(1),
      }));
    return {
      fontName: folder,
      files,
    };
  });
}

/**
 * Loads sentences from a text file.
 */
export async function loadSentences(filePath: string): Promise<string[]> {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(
        `Sentences file ${filePath} not found. Using default sentences.`
      );
      fs.writeFileSync(
        filePath,
        "The quick brown fox jumps over the lazy dog.\nHello World.\nThis is a test sentence."
      );
    }
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    return fileContent.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    console.error(`Error loading sentences from ${filePath}:`, error);
    return ["Default sentence if file read fails."];
  }
}

export function generateRandomStringFromChars(chars: string[]): string {
  const length = getRandomInt(1, 12);
  let result = "";
  for (let i = 0; i < length; i++) {
    const char = getRandomElement(chars);
    result += char;
  }

  return result;
}

/**
 * Returns an analogous color for a given hex color (shifts hue by +30 degrees).
 */
export function getAnalogousColor(
  hex: string,
  degreeShift: number = 30
): string {
  // Helper: hex to RGB
  function hexToRgb(hex: string) {
    let color = hex.replace("#", "");
    if (color.length === 3)
      color = color
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return { r, g, b };
  }
  // Helper: RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h, s, l };
  }
  // Helper: HSL to RGB
  function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
  // Helper: RGB to hex
  function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  const { r, g, b } = hexToRgb(hex);
  let { h, s, l } = rgbToHsl(r, g, b);
  h = (h * 360 + degreeShift) % 360;
  if (h < 0) h += 360;
  h /= 360;
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export async function getTopColors(
  imagePath: string,
  count: number = 2,
  maxImageDimension: number = 6
): Promise<string[]> {
  try {
    // Read the image and resize it to a smaller buffer
    const resizedBuffer = await sharp(imagePath)
      .resize(maxImageDimension, maxImageDimension, {
        fit: sharp.fit.inside, // Maintain aspect ratio, don't enlarge
        withoutEnlargement: true, // Don't enlarge if original is smaller
      })
      .toBuffer();

    const palette = await Vibrant.from(resizedBuffer).getPalette();

    const swatches = Object.values(palette)
      .filter((swatch) => swatch !== null)
      .sort((a, b) => (b?.population || 0) - (a?.population || 0))
      .slice(0, count);

    return swatches.map((swatch) => swatch!.hex);
  } catch (error) {
    console.error(`Error processing image ${imagePath}:`, error);
    return [];
  }
}

/**
 * Returns a dynamic hex color for text that contrasts well with the provided top colors from an image.
 * It tries to pick one of the input colors that provides good contrast. If none do, it falls back to
 * pure black or pure white for guaranteed readability.
 *
 * @param topHexColors An array of 3 hex color strings (e.g., ["#RRGGBB"]).
 * @returns A single hex color string for text.
 */

export function getReadableTextColorFromTopColors(
  topHexColors: string[]
): string {
  if (!topHexColors || topHexColors.length === 0) {
    return "#000000";
  }

  // --- Helper functions ---
  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const rgbToHex = (rgb: [number, number, number]): string => {
    const [r, g, b] = rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))));
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  };

  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const add = max + min;
    const l = add * 0.5;

    let s = 0;
    let h = 0;

    if (diff !== 0) {
      s = l < 0.5 ? diff / add : diff / (2 - add);

      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    if (s === 0) {
      const gray = l * 255;
      return [gray, gray, gray];
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return [
      hue2rgb(p, q, h + 1 / 3) * 255,
      hue2rgb(p, q, h) * 255,
      hue2rgb(p, q, h - 1 / 3) * 255,
    ];
  };

  const calculateLuminance = (r: number, g: number, b: number): number => {
    const sRGB = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const calculateContrastRatio = (L1: number, L2: number): number => {
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };

  const getColorDistance = (
    color1: [number, number, number],
    color2: [number, number, number]
  ): number => {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    return Math.sqrt(
      Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
    );
  };

  // --- Main Logic ---

  // Convert input colors to RGB and calculate luminances
  const backgroundColors = topHexColors.map((hex) => {
    const rgb = hexToRgb(hex);
    const luminance = calculateLuminance(rgb[0], rgb[1], rgb[2]);
    return { hex, rgb, luminance };
  });

  // Calculate weighted average luminance (first color gets more weight as it's most dominant)
  const weights = backgroundColors.map((_, i) => Math.pow(0.7, i));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const averageBackgroundLuminance =
    backgroundColors.reduce(
      (sum, color, i) => sum + color.luminance * weights[i],
      0
    ) / totalWeight;

  const MIN_CONTRAST_RATIO = 4.5; // WCAG AA standard
  const MIN_COLOR_DISTANCE = 50; // Minimum RGB distance to avoid similar colors

  // Generate candidate colors
  const candidates: Array<{
    hex: string;
    rgb: [number, number, number];
    luminance: number;
    score: number;
  }> = [];

  // 1. Add high-contrast basics
  candidates.push(
    {
      hex: "#000000",
      rgb: [0, 0, 0],
      luminance: calculateLuminance(0, 0, 0),
      score: 0,
    },
    {
      hex: "#FFFFFF",
      rgb: [255, 255, 255],
      luminance: calculateLuminance(255, 255, 255),
      score: 0,
    },
    {
      hex: "#333333",
      rgb: [51, 51, 51],
      luminance: calculateLuminance(51, 51, 51),
      score: 0,
    },
    {
      hex: "#F0F0F0",
      rgb: [240, 240, 240],
      luminance: calculateLuminance(240, 240, 240),
      score: 0,
    }
  );

  // 2. Generate harmonious colors based on dominant colors
  for (const bgColor of backgroundColors.slice(0, 2)) {
    // Use top 2 colors
    const [r, g, b] = bgColor.rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    // Complementary colors (opposite hue)
    const compHue = (h + 180) % 360;

    // Generate variations with different lightness values
    const lightnessTbSts =
      averageBackgroundLuminance > 0.5
        ? [15, 25, 35] // Dark colors for light backgrounds
        : [75, 85, 95]; // Light colors for dark backgrounds

    for (const targetL of lightnessTbSts) {
      // Complementary color
      const compRgb = hslToRgb(compHue, Math.min(s, 70), targetL);
      candidates.push({
        hex: rgbToHex(compRgb),
        rgb: compRgb,
        luminance: calculateLuminance(compRgb[0], compRgb[1], compRgb[2]),
        score: 0,
      });

      // Desaturated version of original
      const desatRgb = hslToRgb(h, Math.max(s * 0.3, 10), targetL);
      candidates.push({
        hex: rgbToHex(desatRgb),
        rgb: desatRgb,
        luminance: calculateLuminance(desatRgb[0], desatRgb[1], desatRgb[2]),
        score: 0,
      });
    }
  }

  // 3. Score all candidates
  for (const candidate of candidates) {
    // Calculate contrast score
    const contrastRatio = calculateContrastRatio(
      candidate.luminance,
      averageBackgroundLuminance
    );

    // Skip if contrast is too low
    if (contrastRatio < MIN_CONTRAST_RATIO) {
      candidate.score = -1;
      continue;
    }

    // Check distance from all background colors
    const minDistance = Math.min(
      ...backgroundColors.map((bg) => getColorDistance(candidate.rgb, bg.rgb))
    );

    // Skip if too similar to background
    if (minDistance < MIN_COLOR_DISTANCE) {
      candidate.score = -1;
      continue;
    }

    // Calculate score (higher is better)
    let score = 0;

    // Contrast score (30% weight)
    score += Math.min(contrastRatio / 7, 1) * 30;

    // Color distance score (25% weight)
    score += Math.min(minDistance / 150, 1) * 25;

    // Preference for neutral colors for readability (20% weight)
    const [r, g, b] = candidate.rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    const neutralScore = Math.max(0, 1 - s / 100); // Lower saturation = higher score
    score += neutralScore * 20;

    // Preference for appropriate lightness (15% weight)
    const lightnessScore =
      averageBackgroundLuminance > 0.5
        ? Math.max(0, 1 - candidate.luminance * 2) // Prefer darker for light backgrounds
        : Math.min(candidate.luminance * 2, 1); // Prefer lighter for dark backgrounds
    score += lightnessScore * 15;

    // Bonus for classic choices (10% weight)
    if (candidate.hex === "#000000" || candidate.hex === "#FFFFFF") {
      score += 10;
    }

    candidate.score = score;
  }

  // Find the best candidate
  const validCandidates = candidates.filter((c) => c.score > 0);

  if (validCandidates.length === 0) {
    // Fallback to simple black/white choice
    return averageBackgroundLuminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  // Return the highest scoring candidate
  const bestCandidate = validCandidates.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  return bestCandidate.hex;
}

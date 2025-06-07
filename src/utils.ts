import fs from "fs";
import { Vibrant } from "node-vibrant/node";
import path from "path";

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

export function injectSpecialChars(
  text: string,
  specialChars: string[]
): string {
  // Decide how many chars to inject (1 to 3)
  const numToInject = getRandomInt(1, 3);
  let chars = text.split("");
  for (let i = 0; i < numToInject; i++) {
    const char = getRandomElement(specialChars);
    // Random position (including start/end)
    const pos = getRandomInt(0, chars.length);
    chars.splice(pos, 0, char);
  }
  return chars.join("");
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
  count: number = 3
): Promise<string[]> {
  const palette = await Vibrant.from(imagePath).getPalette();
  const swatches = Object.values(palette)
    .filter((swatch) => swatch !== null)
    .sort((a, b) => (b?.population || 0) - (a?.population || 0))
    .slice(0, count);

  return swatches.map((swatch) => swatch!.hex);
}

// Returns a single hex color for text, given an array of 3 top hex colors from an image.
export function getReadableTextColorFromTopColors(topColors: string[]): string {
  // Helper to parse hex to RGB
  function hexToRgb(hex: string) {
    const n = hex.replace("#", "");
    return [
      parseInt(n.substring(0, 2), 16),
      parseInt(n.substring(2, 4), 16),
      parseInt(n.substring(4, 6), 16),
    ];
  }
  // Helper to convert RGB to hex
  function rgbToHex([r, g, b]: number[]) {
    return (
      "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0")
    );
  }
  // Average the RGB values
  const avg = [0, 1, 2].map((i) =>
    Math.round(
      (hexToRgb(topColors[0])[i] +
        hexToRgb(topColors[1])[i] +
        hexToRgb(topColors[2])[i]) /
        3
    )
  );
  // Get complementary color
  const comp = avg.map((v) => 255 - v);
  const compHex = rgbToHex(comp);
  // Check brightness for fallback
  const brightness = (avg[0] * 299 + avg[1] * 587 + avg[2] * 114) / 1000;
  // If complementary color is too close to any top color, fallback to black/white
  const isTooClose = topColors.some((c) => {
    const rgb = hexToRgb(c);
    return (
      Math.abs(rgb[0] - comp[0]) < 32 &&
      Math.abs(rgb[1] - comp[1]) < 32 &&
      Math.abs(rgb[2] - comp[2]) < 32
    );
  });
  if (isTooClose) {
    return brightness > 128 ? "#000000" : "#FFFFFF";
  }
  return compHex;
}

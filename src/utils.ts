import fs from "fs";
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
export function getFamilyColor(hex: string, amount = 20): string {
  let color = hex.replace("#", "");
  if (color.length === 3)
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Increase lightness by amount (clamp to 255)
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);

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

import puppeteer, { Page, Browser } from "puppeteer";
import fs from "fs";
import path, { dirname } from "path";
import cliProgress, { MultiBar } from "cli-progress";
import pLimit from "p-limit";
import { fileURLToPath } from "url";
import {
  getFontFiles,
  loadSentences,
  getRandomInt,
  getRandomElement,
  getRandomFloat,
  getFontFamilies,
  injectSpecialChars,
} from "./utils.js";
import { Effect, StyleProperty, EffectContext } from "./effects/Effect.js";
import { TextColorEffect } from "./effects/textColor.js";
import { BackgroundColorEffect } from "./effects/backgroundColor.js";
import { BackgroundImageEffect } from "./effects/backgroundImage.js";
import { FontWeightEffect } from "./effects/fontWeight.js";
import { FontStyleEffect } from "./effects/fontStyle.js";
import { TextShadowEffect } from "./effects/textShadow.js";
import { RotationEffect } from "./effects/RotationEffect.js";
import { TransformEffect } from "./effects/TransformEffect.js";
import { StrokeEffect } from "./effects/StrokeEffect.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONT_DIR = path.join(__dirname, "../assets/fonts");
const OUTPUT_DIR = path.join(__dirname, "../output");
const SENTENCES_FILE = path.join(__dirname, "../sentences.txt");
const IMAGE_DIR = path.join(__dirname, "../assets/images");
const imageFiles = fs.existsSync(IMAGE_DIR)
  ? fs.readdirSync(IMAGE_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  : [];
const CONCURRENT_TABS = 4;
const IMAGES_PER_FONT = 100;
// Image dimensions
const MIN_WIDTH = 260;
const MAX_WIDTH = 1200;
const MIN_HEIGHT = 70;
const MAX_HEIGHT = 500;
const MIN_QUALITY = 50;
const MAX_QUALITY = 95;
const MIN_FONT_SIZE = 50;
const MAX_FONT_SIZE = 120;

// ! don't mess with the order of Effects placed in each effect array
const backgroundEffects: Effect[] = [
  new BackgroundColorEffect(1),
  new BackgroundImageEffect(0.7),
];

// picks a contrasting color based on ctx.bgColor
const textEffects: Effect[] = [
  new TextColorEffect(1.0),
  new FontStyleEffect(0.2),
];

const postTextEffects: Effect[] = [
  new StrokeEffect(0.4),
  // new StrokeEffect(1),
  new TextShadowEffect(0.3),
  new RotationEffect(0.6),
  new TransformEffect(0.4),
];

const availableEffects = [
  ...backgroundEffects,
  ...textEffects,
  ...postTextEffects,
];

const specialChars: string[] = [
  "۰",
  "۱",
  "۲",
  "۳",
  "۴",
  "۵",
  "۶",
  "۷",
  "۸",
  "۹",
  "،",
  "؛",
  "؟",
  "«",
  "»",
  "‹",
  "›",
  "!",
  "(",
  ")",
  ";",
  ":",
  "'",
  '"',
  ",",
  ".",
  "،",
  "ٕ",
  "ٍ",
  "ِ",
];
interface ImageOptions {
  width: number;
  height: number;
  quality: number;
}
async function generateImage(
  page: Page,
  sentence: string,
  imageOptions: ImageOptions,
  font: {
    name: string;
    extension: string;
    base64Content: string;
  },
  imageIndex: number
): Promise<string | null> {
  try {
    const imageWidth = imageOptions.width;
    const imageHeight = imageOptions.height;
    const imageQuality = imageOptions.quality;

    await page.setViewport({ width: imageWidth, height: imageHeight });

    const effectContext: EffectContext = {
      imageWidth,
      imageHeight,
      fontFamily: font.name,
      shared: {
        imageFiles, // Pass the array of image filenames
      },
    };

    const activeStyles: StyleProperty[] = [];

    for (const effect of availableEffects) {
      if (effect.shouldApply()) {
        const cssProps = await effect.getCss(effectContext);
        if (cssProps) {
          activeStyles.push(...cssProps);
        }
      }
    }

    let defaultFontSizePx = getRandomInt(MIN_FONT_SIZE, MAX_FONT_SIZE);
    const finalText =
      Math.random() < 0 ? sentence : injectSpecialChars(sentence, specialChars);

    const bodyStyles = activeStyles
      .filter((s) => s.property.startsWith("background"))
      .map((s) => `${s.property}: ${s.value};`)
      .join("\n");
    const textSpecificStyles = activeStyles
      .filter((s) => !s.property.startsWith("background"))
      .map((s) => `${s.property}: ${s.value};`)
      .join("\n");

    await page.setContent(
      `
      <html dir="rtl" lang="fa-IR">
        <head>
          <style>
            @font-face {
              font-family: "${font.name}";
              src: url(data:font/${font.extension};base64,${font.base64Content});
            }
            body {
              margin: 0;
              padding: 0;
              width: ${imageWidth}px;
              height: ${imageHeight}px;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden; /* Crucial */
              ${bodyStyles}
            }
            #textContainer {
              font-family: "${font.name}", sans-serif;
              font-size: ${defaultFontSizePx}px;
              text-align: center; /* Or make this random too */
              overflow-wrap: break-word;
              word-break: break-word;
              box-sizing: border-box;
              position: relative; 
              line-height: 1.15;
              ${textSpecificStyles}
            }
          </style>
        </head>
        <body><div id="textContainer">${finalText}</div></body>
      </html>
    `,
      { waitUntil: "domcontentloaded" }
    );

    const fontOutputDir = path.join(OUTPUT_DIR, font.name);
    if (!fs.existsSync(fontOutputDir)) {
      fs.mkdirSync(fontOutputDir, { recursive: true });
    }

    await page.screenshot({
      path: `${fontOutputDir}/image_${imageIndex + 1}.jpeg`,
      type: "jpeg",
      quality: imageQuality,
      fullPage: false,
    });

    // console.log(
    //   `🖼️ Generated: ${`${fontOutputDir}/image_${
    //     imageIndex + 1
    //   }.jpeg`} (${imageWidth}x${imageHeight}, Q:${imageQuality}, Font: ${
    //     font.name
    //   }, Size: ${defaultFontSizePx.toFixed(1)}px)`
    // );
    return `${fontOutputDir}/image_${imageIndex + 1}.jpeg`;
  } catch (error) {
    console.error(
      `Error generating image for font ${
        font.name
      }, sentence "${sentence.substring(0, 20)}...":`,
      error
    );
    return null;
  }
}

// ??????????????? ???????????????????? ?????????????????????

(async function () {
  console.log("Starting text image generator... 📝✨");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const fontFiles = getFontFamilies(FONT_DIR);
  if (fontFiles.length === 0) {
    console.error(
      `No font files found in ${FONT_DIR}. Please add some .ttf, .otf, .woff, or .woff2 files.`
    );
    return;
  }
  console.log(
    `Found ${fontFiles.length} font families: ${fontFiles
      .map((f) => f.fontName)
      .join(", ")}`
  );

  const sentences = await loadSentences(SENTENCES_FILE);
  if (sentences.length === 0) {
    console.error(
      `No sentences found in ${SENTENCES_FILE}. Please add some sentences.`
    );
    return;
  }
  console.log(`Loaded ${sentences.length} sentences.`);

  const multiBar = new cliProgress.MultiBar(
    {
      hideCursor: true,
    },
    cliProgress.Presets.shades_grey
  );
  process.on("SIGINT", () => {
    multiBar.stop();
    console.log("\ninterrupted process! goodbye :(");
    process.exit();
  });

  try {
    console.log("Launching Puppeteer browser... 🌐");
    const browser = await puppeteer.launch({
      // headless: false,
      headless: "shell",
      args: [
        "--disable-features=CalculateNativeWinOcclusion",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-timer-throttling",
        "--font-render-hinting=none",
      ],
    });

    const fontsBar = multiBar.create(
      fontFiles.length,
      0,
      { name: " ... " },
      {
        barsize: 50,
        format:
          " {bar} | {name} | {value}/{total} | {duration_formatted} has passed! ETA: {eta}s",
      }
    );

    const concurrency = CONCURRENT_TABS; // You can adjust this value
    const limit = pLimit(concurrency);
    // Create page pool
    console.log(`Creating ${concurrency} browser pages...`);
    const pagePool: Page[] = [];
    for (let i = 0; i < concurrency; i++) {
      pagePool.push(await browser.newPage());
    }
    let pageIndex = 0;

    // TODO: for (let fontIndex = 0; fontIndex < fontFiles.length; fontIndex++) {
    for (let fontIndex = 0; fontIndex < 1; fontIndex++) {
      const font = fontFiles[fontIndex];
      fontsBar.increment(undefined, { name: font.fontName });

      const imagesBar = multiBar.create(IMAGES_PER_FONT, 0, undefined, {
        clearOnComplete: true,
        barsize: 30,
        stopOnComplete: true,
        format: " {bar} | {value}/{total} | {name}",
      });

      const imagePromises = Array.from(
        { length: IMAGES_PER_FONT },
        (_, index) =>
          limit(async () => {
            const page = pagePool[pageIndex % pagePool.length];
            pageIndex++;

            const imageOptions: ImageOptions = {
              height: getRandomInt(MIN_HEIGHT, MAX_HEIGHT),
              width: getRandomInt(MIN_WIDTH, MAX_WIDTH),
              quality: getRandomInt(MIN_QUALITY, MAX_QUALITY),
            };
            const randomFontFile = getRandomElement(font.files);
            const fileBuffer = await fs.promises.readFile(randomFontFile.path);
            const fontData = {
              name: font.fontName,
              extension: randomFontFile.extension,
              base64Content: fileBuffer.toString("base64"),
            };

            const result = await generateImage(
              page,
              getRandomElement(sentences),
              imageOptions,
              fontData,
              index
            );
            imagesBar.increment(undefined, { name: result });
            return result;
          })
      );

      await Promise.all(imagePromises);
      multiBar.remove(imagesBar);
    }
    multiBar.stop();
    // Close all pages in the pool
    for (const page of pagePool) {
      await page.close();
    }
    await browser.close();
    console.log("\n🎉 All done! Images generated in the 'output' directory.");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
})();

import puppeteer, { Page, Browser } from "puppeteer";
import fs from "fs";
import path from "path";
import cliProgress, { MultiBar } from "cli-progress";
import {
  getFontFiles,
  loadSentences,
  getRandomInt,
  getRandomElement,
  getRandomFloat,
  getFontFamilies,
} from "./utils";
import { Effect, StyleProperty, EffectContext } from "./effects/Effect";
import { TextColorEffect } from "./effects/textColor";
import { BackgroundColorEffect } from "./effects/backgroundColor";
import { BackgroundImageEffect } from "./effects/backgroundImage";
import { FontWeightEffect } from "./effects/fontWeight";
import { FontStyleEffect } from "./effects/fontStyle";
import { TextShadowEffect } from "./effects/textShadow";
import { RotationEffect } from "./effects/RotationEffect";
import { TransformEffect } from "./effects/TransformEffect";
import { StrokeEffect } from "./effects/StrokeEffect";

const FONT_DIR = path.join(import.meta.dir, "../assets/fonts");
const OUTPUT_DIR = path.join(import.meta.dir, "../output");
const SENTENCES_FILE = path.join(import.meta.dir, "../sentences.txt");
const IMAGES_PER_FONT = 100;
const IMAGE_DIR = path.join(import.meta.dir, "../assets/images");
const imageFiles = fs.existsSync(IMAGE_DIR)
  ? fs.readdirSync(IMAGE_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  : [];

// Image dimensions
const MIN_WIDTH = 220;
const MAX_WIDTH = 1200;
const MIN_HEIGHT = 67;
const MAX_HEIGHT = 650;
const MIN_QUALITY = 45;
const MAX_QUALITY = 95;
const availableEffects: Effect[] = [
  new TextColorEffect(1),
  new BackgroundColorEffect(0.9),
  // new BackgroundImageEffect(0.7), // Lower probability for BG images
  // new FontStyleEffect(0.2),
  // new TextShadowEffect(0.3),
  // ! new BlurEffect(0.1),
  // new StrokeEffect(0.5),
  new StrokeEffect(1),
  new RotationEffect(0.6),
  new TransformEffect(0.4),
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
      textContent: sentence,
      fontFamily: font.name,
      shared: {
        imageFiles, // Pass the array of image filenames
      },
    };

    const activeStyles: StyleProperty[] = [];

    for (const effect of availableEffects) {
      if (effect.shouldApply()) {
        const cssProps = effect.getCss(effectContext);
        if (cssProps) {
          activeStyles.push(...cssProps);
        }
      }
    }

    let defaultFontSizePx = getRandomInt(36, 96);

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
              src: url(data:font/${font.extension};base64,${
        font.base64Content
      });
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
              ${textSpecificStyles}
              /* transform: rotate(${getRandomInt(-5, 5)}deg); */
            }
          </style>
        </head>
        <body><div id="textContainer">${sentence}</div></body>
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

//*-----------------------/main\----------------------------*\\
async function main() {
  console.log("Starting text image generator... 📝✨");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fontFiles = getFontFiles(FONT_DIR);
  if (fontFiles.length === 0) {
    console.error(
      `No font files found in ${FONT_DIR}. Please add some .ttf, .otf, .woff, or .woff2 files.`
    );
    return;
  }
  console.log(
    `Found ${fontFiles.length} font(s): ${fontFiles
      .map((f) => f.name)
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

  const fontsWithContent = await Promise.all(
    fontFiles.map(async (font) => {
      const fileBuffer = await fs.promises.readFile(font.path);
      return { ...font, base64Content: fileBuffer.toString("base64") };
    })
  );

  let browser: Browser | null = null;
  try {
    console.log("Launching Puppeteer browser... 🌐");
    browser = await puppeteer.launch({
      headless: true, // "new" is default, can be true for older versions
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });
    const page = await browser.newPage(); // Create one page and reuse it

    for (const font of fontsWithContent) {
      console.log(`\nProcessing font: "${font.name}"...`);
      const fontOutputDir = path.join(OUTPUT_DIR, font.name);
      if (!fs.existsSync(fontOutputDir)) {
        fs.mkdirSync(fontOutputDir, { recursive: true });
      }

      for (let i = 0; i < IMAGES_PER_FONT; i++) {
        const sentence = getRandomElement(sentences);
        if (!sentence) continue;

        const imageOptions: ImageOptions = {
          height: getRandomInt(MIN_HEIGHT, MAX_HEIGHT),
          width: getRandomInt(MIN_WIDTH, MAX_WIDTH),
          quality: getRandomInt(MIN_QUALITY, MAX_QUALITY),
        };
        await generateImage(page, sentence, imageOptions, font, i);
      }
      console.log(
        `✅ Finished processing font: "${font.name}". Generated ${IMAGES_PER_FONT} images.`
      );
    }
    await page.close();
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  } finally {
    if (browser) {
      console.log("\nClosing Puppeteer browser... 👋");
      await browser.close();
    }
  }
  console.log("\n🎉 All done! Images generated in the 'output' directory.");
}

// main().catch(console.error);

// ??????????????? Testing and fucking around ?????????????????????

(async function () {
  const fontFiles = getFontFamilies(FONT_DIR);

  // Progress bars setup
  // const fontsBar = new cliProgress.SingleBar({
  //   format:
  //     "Fonts |{bar}| {duration_formatted} has passed! ETA: {eta}s | {value}/{total} Fonts --> {fontName}",
  //   barCompleteChar: "\u2588",
  //   barIncompleteChar: "\u2591",
  //   hideCursor: true,
  // });
  // const imagesBar = new cliProgress.SingleBar({
  //   format:
  //     "  Images |{bar}| {percentage}% | {value}/{total} Images - image {imageName} created!",
  //   barCompleteChar: "\u2588",
  //   barIncompleteChar: "\u2591",
  //   hideCursor: true,
  //   clearOnComplete: true,
  // });
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

  const browser = await puppeteer.launch({
    // headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
    ],
  });
  const page = await browser.newPage();

  // for (let fontIndex = 0; fontIndex < fontFiles.length; fontIndex++) {
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

  for (let fontIndex = 0; fontIndex < 1; fontIndex++) {
    const font = fontFiles[fontIndex];
    fontsBar.increment(undefined, { name: font.fontName });

    const imagesBar = multiBar.create(IMAGES_PER_FONT, 0, undefined, {
      clearOnComplete: true,
      barsize: 30,
      stopOnComplete: true,
      format: " {bar} | {value}/{total} | {name}",
    });
    for (let index = 0; index < IMAGES_PER_FONT; index++) {
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
        "سلام این یک متن تستی میباشد!",
        imageOptions,
        fontData,
        index
      );
      imagesBar.increment(undefined, { name: result });
    }

    multiBar.remove(imagesBar);
  }
  multiBar.stop();
  await browser.close();
})();

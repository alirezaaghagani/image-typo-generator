import puppeteer, { Page } from "puppeteer";
import fs from "fs";
import cliProgress, { type SingleBar } from "cli-progress";
import pLimit from "p-limit";
import {
  loadSentences,
  getRandomInt,
  getRandomElement,
  getFontFamilies,
} from "./utils.js";
import { config } from "./config.js";
import { generateImage, ImageOptions } from "./generateImage.js";

(async function () {
  console.log("Starting text image generator... 📝✨");
  if (!fs.existsSync(config.OUTPUT_DIR)) {
    fs.mkdirSync(config.OUTPUT_DIR, { recursive: true });
  }
  const fontFiles = getFontFamilies(config.FONT_DIR);
  if (fontFiles.length === 0) {
    console.error(
      `No font files found in ${config.FONT_DIR}. Please add some .ttf, .otf, .woff, or .woff2 files.`
    );
    return;
  }
  console.log(
    `Found ${fontFiles.length} font families: ${fontFiles
      .map((f) => f.fontName)
      .join(", ")}`
  );

  const sentences = await loadSentences(config.SENTENCES_FILE);
  if (sentences.length === 0) {
    console.error(
      `No sentences found in ${config.SENTENCES_FILE}. Please add some sentences.`
    );
    return;
  }
  console.log(`Loaded ${sentences.length} sentences.`);

  const multiBar = config.PROGRESS_BAR
    ? new cliProgress.MultiBar(
        { hideCursor: true },
        cliProgress.Presets.shades_grey
      )
    : {
        create: () => ({
          increment: () => {},
          stop: () => {},
          remove: () => {},
        }),
        stop: () => {},
        remove: () => {},
      };
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
        "--disable-gpu",
        "--single-process",
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

    const concurrency = config.CONCURRENT_TABS; // You can adjust this value
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

      const imagesBar = multiBar.create(config.IMAGES_PER_FONT, 0, undefined, {
        clearOnComplete: true,
        barsize: 30,
        stopOnComplete: true,
        format: " {bar} | {value}/{total} | {name}",
      });

      const imagePromises = Array.from(
        { length: config.IMAGES_PER_FONT },
        (_, index) =>
          limit(async () => {
            const page = pagePool[pageIndex % pagePool.length];
            pageIndex++;

            const imageOptions: ImageOptions = {
              height: getRandomInt(config.MIN_HEIGHT, config.MAX_HEIGHT),
              width: getRandomInt(config.MIN_WIDTH, config.MAX_WIDTH),
              quality: getRandomInt(config.MIN_QUALITY, config.MAX_QUALITY),
            };
            const randomFontFile = getRandomElement(font.files);
            const fileBuffer = await fs.promises.readFile(randomFontFile.path);
            const fontData = {
              name: font.fontName,
              extension: randomFontFile.extension,
              base64Content: fileBuffer.toString("base64"),
            };
            // console.time(`generateImage ${index}`);
            const result = await generateImage(
              page,
              getRandomElement(sentences),
              imageOptions,
              fontData,
              index
            );
            // console.timeEnd(`generateImage ${index}`);
            imagesBar.increment(undefined, { name: result });
            return result;
          })
      );
      await Promise.all(imagePromises);
      multiBar.remove(imagesBar as SingleBar);
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

import fs from "fs";
import {
  loadSentences,
  getRandomInt,
  getRandomElement,
  getFontFamilies,
} from "./utils.js";
import { config } from "./config.js";
import { generateImage, ImageOptions } from "./generateImage.js";
import { Cluster } from "puppeteer-cluster";
import { startImageServer } from "./server.js";

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
  console.log(`- Found ${fontFiles.length} font families.`);

  const sentences = await loadSentences(config.SENTENCES_FILE);
  if (sentences.length === 0) {
    console.error(
      `No sentences found in ${config.SENTENCES_FILE}. Please add some sentences.`
    );
    return;
  }
  console.log(`- Loaded ${sentences.length} sentences.`);

  // start a server to host bg images
  const server = startImageServer();
  console.log(
    `- Image server running at http://${server.hostname}:${server.port}/`
  );

  try {
    console.log(
      `Launching ${config.CONCURRENT_TABS} concurrent browser tabs... 🌐`
    );
    const cluster: Cluster<{ font: (typeof fontFiles)[0] }> =
      await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: config.CONCURRENT_TABS,
        monitor: true,
        timeout: 270000,
        puppeteerOptions: {
          headless: "shell",
          args: [
            "--disable-features=CalculateNativeWinOcclusion",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-background-timer-throttling",
            "--font-render-hinting=none",
            "--disable-gpu",
            // "--single-process",
          ],
        },
      });

    process.on("SIGINT", async () => {
      await cluster.close();
      await server.stop();
      process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
      console.log("\ninterrupted process! goodbye :(");
      process.exit();
    });

    await cluster.task(async ({ page, data: { font } }) => {
      for (let index = 0; index < config.IMAGES_PER_FONT; index++) {
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
        await generateImage(
          page,
          getRandomElement(sentences),
          imageOptions,
          fontData,
          index
        );
        // console.timeEnd(`generateImage ${index}`);
      }
    });

    console.time(
      `Generation of ${fontFiles.length} fonts(each ${config.IMAGES_PER_FONT} images) cluster:`
    );
    // start the pool
    for (let fontIndex = 0; fontIndex < fontFiles.length; fontIndex++) {
      // ! for (let fontIndex = 0; fontIndex < 6; fontIndex++) {
      const font = fontFiles[fontIndex];
      cluster.queue({ font });
    }
    await cluster.idle();
    console.timeEnd(
      `Generation of ${fontFiles.length} fonts(each ${config.IMAGES_PER_FONT} images) cluster:`
    );
    await cluster.close();
    await server.stop();
    console.log("\nAll done! Images generated in the 'output' directory.");
    process.exit();
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
})();

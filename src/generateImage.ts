import { Page } from "puppeteer";
import { EffectContext, StyleProperty } from "./effects/Effect.js";
import { config } from "./config.js";
import { generateRandomStringFromChars, getRandomInt } from "./utils.js";
import path from "path";
import fs from "fs";

const availableEffects = [
  ...config.backgroundEffects,
  ...config.textEffects,
  ...config.postTextEffects,
];
const imageFiles = fs.existsSync(config.IMAGE_DIR)
  ? fs
      .readdirSync(config.IMAGE_DIR)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  : [];
export interface ImageOptions {
  width: number;
  height: number;
  quality: number;
}
export interface FontFileData {
  name: string;
  extension: string;
  base64Content: string;
}
export async function generateImage(
  page: Page,
  sentence: string,
  imageOptions: ImageOptions,
  font: FontFileData,
  imageIndex: number
): Promise<string | null> {
  try {
    const imageWidth = imageOptions.width;
    const imageHeight = imageOptions.height;
    const imageQuality = imageOptions.quality;

    await page.setViewport({ width: imageWidth, height: imageHeight });

    // effect context is needed so each effect can be aware of other effects so it can change its behavior based on them.
    // (for example: text color effect should be aware of background color or image to determine a suitable color for text)
    const effectContext: EffectContext = {
      imageWidth,
      imageHeight,
      fontFamily: font.name,
      shared: {
        imageFiles, // Pass the array of image filenames
        debug: [],
      },
    };

    const activeStyles: StyleProperty[] = [];

    // determine the what effects should apply for this image by rolling dice (effect.shouldApply())
    // console.time(`effects ${imageIndex}`);
    for (const effect of availableEffects) {
      if (effect.shouldApply()) {
        const cssProps = await effect.getCss(effectContext);
        if (cssProps) {
          activeStyles.push(...cssProps);
        }
      }
    }
    // console.timeEnd(`effects ${imageIndex}`);

    let fontSizePx = getRandomInt(config.MIN_FONT_SIZE, config.MAX_FONT_SIZE);
    // choose if final image should be a text or digits
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const finalText =
      Math.random() < config.NUM_PROBABILITY
        ? generateRandomStringFromChars(persianDigits, 14)
        : sentence;

    const bodyStyles = activeStyles
      .filter((s) => s.property.startsWith("background"))
      .map((s) => `${s.property}: ${s.value};`)
      .join("\n");
    const textSpecificStyles = activeStyles
      .filter((s) => !s.property.startsWith("background"))
      .map((s) => `${s.property}: ${s.value};`)
      .join("\n");
    // console.time(`setContent ${imageIndex}`);
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
              font-size: ${fontSizePx}px;
              text-align: center; /* Or make this random too */
              overflow-wrap: break-word;
              word-break: break-word;
              box-sizing: border-box;
              position: relative; 
              line-height: 1.2;
              ${textSpecificStyles}
            }
          </style>
        </head>
        <body><div id="textContainer">${finalText}</div></body>
        <script defer>
        (()=>{
          const el = document.getElementById("textContainer")
          const rect = el.getBoundingClientRect();
          console.log(rect.y)
          if(rect.y < -50){
            console.log("bang!")
            el.style.height = "100%";
            el.style.width = "100%";
          }

          })()
        </script>
      </html>
    `,
      { waitUntil: "domcontentloaded" }
    );
    // console.timeEnd(`setContent ${imageIndex}`);

    const fontOutputDir = path.join(config.OUTPUT_DIR, font.name);
    if (!fs.existsSync(fontOutputDir)) {
      fs.mkdirSync(fontOutputDir, { recursive: true });
    }

    // console.time(`screenshot ${imageIndex}`);
    await page.screenshot({
      path: `${fontOutputDir}/image_${imageIndex + 1}.jpeg`,
      type: "jpeg",
      quality: imageQuality,
      optimizeForSpeed: true,
    });
    // console.timeEnd(`screenshot ${imageIndex}`);

    return `${fontOutputDir}/image_${imageIndex + 1}.jpeg`;
  } catch (error) {
    console.error(
      `Error generating image number ${imageIndex} for font ${
        font.name
      }, sentence "${sentence.substring(0, 12)}...":`,
      error
    );
    return null;
  }
}

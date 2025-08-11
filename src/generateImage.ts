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

    const effectContext: EffectContext = {
      imageWidth,
      imageHeight,
      fontFamily: font.name,
      shared: {
        imageFiles, // Pass the array of image filenames
      },
    };

    const activeStyles: StyleProperty[] = [];

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

    let defaultFontSizePx = getRandomInt(
      config.MIN_FONT_SIZE,
      config.MAX_FONT_SIZE
    );
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const finalText =
      Math.random() < config.NUM_PROBABILITY
        ? generateRandomStringFromChars(persianDigits)
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
              font-size: ${defaultFontSizePx}px;
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
    // const textRect = await page.evaluate(() => {
    //   const el = document.getElementById("textContainer");
    //   const rect = el!.getBoundingClientRect();
    //   return {
    //     x: rect.x,
    //     y: rect.y,
    //     width: rect.width,
    //     height: rect.height,
    //   };
    // });

    // console.time(`screenshot ${imageIndex}`);
    await page.screenshot({
      path: `${fontOutputDir}/image_${imageIndex + 1}.jpeg`,
      type: "jpeg",
      quality: imageQuality,
      optimizeForSpeed: true,
      //   clip: textRect,
    });
    // console.timeEnd(`screenshot ${imageIndex}`);

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
      `Error generating image number ${imageIndex} for font ${
        font.name
      }, sentence "${sentence.substring(0, 12)}...":`,
      error
    );
    return null;
  }
}

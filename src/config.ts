import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { BackgroundColorEffect } from "./effects/backgroundColor.js";
import { BackgroundImageEffect } from "./effects/backgroundImage.js";
import { TextColorEffect } from "./effects/textColor.js";
import { FontStyleEffect } from "./effects/fontStyle.js";
import { StrokeEffect } from "./effects/StrokeEffect.js";
import { TextShadowEffect } from "./effects/textShadow.js";
import { RotationEffect } from "./effects/RotationEffect.js";
import { TransformEffect } from "./effects/TransformEffect.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const config = {
  CONCURRENT_TABS: 6,
  IMAGES_PER_FONT: 100,
  MIN_WIDTH: 260,
  MAX_WIDTH: 1100,
  MIN_HEIGHT: 80,
  MAX_HEIGHT: 500,
  MIN_QUALITY: 50,
  MAX_QUALITY: 95,
  MIN_FONT_SIZE: 72,
  MAX_FONT_SIZE: 120,
  OUTPUT_DIR: path.join(__dirname, "../output"),
  FONT_DIR: path.join(__dirname, "../assets/fonts"),
  SENTENCES_FILE: path.join(__dirname, "../sentences.txt"),
  IMAGE_DIR: path.join(__dirname, "../assets/images"),
  // ! don't mess with the order of Effects placed in each effect array
  backgroundEffects: [
    new BackgroundColorEffect(1),
    new BackgroundImageEffect(0.7),
    // new BackgroundImageEffect(1),
  ],
  // picks a contrasting color based on ctx.bgColor
  textEffects: [new TextColorEffect(1.0), new FontStyleEffect(0.2)],
  postTextEffects: [
    new StrokeEffect(0.4),
    // new StrokeEffect(1),
    new TextShadowEffect(0.3),
    new RotationEffect(0.6),
    // new TransformEffect(0.4),
  ],
  NUM_PROBABILITY: 0.12,
  // specialChars: ["،", "؛", "؟", "«", "»", "!", ";", ":", "'", '"', ","],
};

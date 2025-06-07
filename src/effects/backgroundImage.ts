import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import { getRandomInt, getRandomElement, getRandomFloat } from "../utils.js";
import path from "path";

// For this effect to work well, you'd need a source of background images.
// We'll use placeholder URLs (like Unsplash Source or Lorem Picsum) for demonstration.
// In a real scenario, you might have a local folder of images.

export class BackgroundImageEffect extends Effect {
  name = "BackgroundImage";

  constructor(occurrenceProbability = 0.25) {
    // Lower probability as it can be dominant
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    // Get image files from context
    const imageFiles: string[] = context.shared?.imageFiles || [];

    if (!imageFiles.length) return null;

    // Pick a random image
    const randomImage = getRandomElement(imageFiles);
    // Use a relative path for browser (assuming assets/images is public)
    const imageUrl = `http://localhost:3000/${randomImage}`;

    const backgroundStyles: StyleProperty[] = [
      { property: "background-image", value: `url('${imageUrl}')` },
      {
        property: "background-size",
        value: "cover",
      },
    ];
    context.shared.backgroundType = "image";
    context.shared.backgroundImageUrl = randomImage;

    return backgroundStyles;
  }
}

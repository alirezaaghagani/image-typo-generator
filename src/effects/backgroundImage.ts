import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import { getRandomElement } from "../utils.js";
import { config } from "../config.js";

export class BackgroundImageEffect extends Effect {
  name = "BackgroundImage";

  constructor(occurrenceProbability = 0.25) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    // Get image files from context
    const imageFiles: string[] = context.shared?.imageFiles || [];

    if (!imageFiles.length)
      throw new Error(
        `no image for bgImage is provided in ${config.IMAGE_DIR}`
      );

    // Pick a random image
    const randomImage = getRandomElement(imageFiles);
    const imageUrl = `http://localhost:3000/${randomImage}`;

    const backgroundStyles: StyleProperty[] = [
      { property: "background-image", value: `url('${imageUrl}')` },
      {
        property: "background-size",
        value: "cover",
      },
    ];
    context.shared.backgroundImageName = randomImage;

    return backgroundStyles;
  }
}

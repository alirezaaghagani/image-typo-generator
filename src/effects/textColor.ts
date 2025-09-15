import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import {
  getComplementaryColor,
  getReadableTextColorFromTopColors,
  getTopColors,
} from "../utils.js";
import { join } from "path";

const IMAGE_DIR = join(process.cwd(), "assets", "images");

export class TextColorEffect extends Effect {
  name = "TextColor";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  async getCss(context: EffectContext): Promise<StyleProperty[] | null> {
    let color: string;
    const bgImageName = context.shared.backgroundImageName;
    if (bgImageName) {
      const imagePath = join(IMAGE_DIR, bgImageName);
      const topColors = await getTopColors(imagePath);
      color = getReadableTextColorFromTopColors(topColors);
      // ? debug:
      context.shared.debug.push({
        property: "topColors in image",
        value: topColors.join(" - "),
      });
    } else {
      const bgColor = context.shared.backgroundColor || "#fff";
      color = getComplementaryColor(bgColor);
    }

    context.shared.textColor = color;

    return [{ property: "color", value: color }];
  }
}

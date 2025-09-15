import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import {
  getComplementaryColor,
  getFamilyColor,
  getRandomHexColor,
  getRandomInt,
} from "../utils.js";

export class StrokeEffect extends Effect {
  name = "Stroke";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    const textColor = context.shared.textColor || "#000000";
    const strokeSize = (Math.random() + 0.5) * 4 - 0.4;
    const amountOfShiftingColor =
      Math.random() < 0.5 ? getRandomInt(-100, -40) : getRandomInt(40, 100);
    const strokeColor = getFamilyColor(textColor, amountOfShiftingColor);

    // a method to generate stroke for text with text-shadow property i found online
    let textShadow = "";
    for (var angle = 0; angle < 2 * Math.PI; angle += 1 / strokeSize) {
      if (textShadow !== "") {
        textShadow += ", ";
      }
      textShadow +=
        Math.cos(angle) * strokeSize +
        "px " +
        Math.sin(angle) * strokeSize +
        "px " +
        strokeColor;
    }

    return [{ property: "text-shadow", value: textShadow }];
  }
}

import { Effect, StyleProperty, EffectContext } from "./Effect";
import {
  getComplementaryColor,
  getFamilyColor,
  getRandomHexColor,
  getRandomInt,
} from "../utils";
import { match } from "assert";

export class StrokeEffect extends Effect {
  name = "Stroke";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    const textColor = context.shared.textColor || "#000000";
    const strokeSize = (Math.random() + 0.4) * 4 - 0.8;
    const amountOfShiftingColor =
      Math.random() < 0.5 ? getRandomInt(-160, -40) : getRandomInt(40, 140);
    const strokeColor = getFamilyColor(textColor, amountOfShiftingColor);

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

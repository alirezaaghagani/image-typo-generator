import { Effect, StyleProperty, EffectContext } from "./Effect";
import { getRandomHexColor, getRandomInt } from "../utils";

export class StrokeEffect extends Effect {
  name = "Stroke";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;
    const strokeSize = (Math.random() + 0.4) * 4 - 0.8;
    const strokeColor = getRandomHexColor();

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

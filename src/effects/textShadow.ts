import { Effect, StyleProperty, EffectContext } from "./Effect";
import { getRandomInt, getRandomHexColor, getRandomFloat } from "../utils";

export class TextShadowEffect extends Effect {
  name = "TextShadow";

  constructor(occurrenceProbability = 0.3) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;

    const numShadows = getRandomInt(1, 3);
    const shadows: string[] = [];

    for (let i = 0; i < numShadows; i++) {
      const offsetX = getRandomInt(-5, 5);
      const offsetY = getRandomInt(-5, 5);
      const blurRadius = getRandomInt(0, 14);
      const color =
        getRandomHexColor() +
        (Math.random() < 0.7
          ? getRandomInt(10, 99).toString(16).padStart(2, "0")
          : ""); // Optional alpha
      shadows.push(`${offsetX}px ${offsetY}px ${blurRadius}px ${color}`);
    }

    return [{ property: "text-shadow", value: shadows.join(", ") }];
  }
}

import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import {
  getRandomHexColor,
  getRandomInt,
  getRandomElement,
  getComplementaryColor,
  getFamilyColor,
  getAnalogousColor,
} from "../utils.js";

export class BackgroundColorEffect extends Effect {
  name = "BackgroundColor";

  constructor(occurrenceProbability = 0.6) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    let bgColor: string;
    const color1 = getRandomHexColor();
    const color2 =
      Math.random() < 0.7
        ? getAnalogousColor(color1, getRandomInt(25, 100))
        : getRandomHexColor();
    const type = getRandomInt(1, 3);
    // const type = 2;

    if (type === 1 || Math.random() < 0.4) {
      // if (type === 1) {
      // Solid color
      bgColor = color1;
    } else if (type === 2) {
      // Linear gradient
      const angle = getRandomInt(0, 360);
      bgColor = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else {
      // Radial gradient
      bgColor = `radial-gradient(circle, ${color1}, ${color2})`;
    }

    context.shared.backgroundColor = color1;
    context.shared.backgroundType = "color";

    return [{ property: "background", value: bgColor }];
  }
}

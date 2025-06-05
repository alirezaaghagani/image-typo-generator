import { Effect, StyleProperty, EffectContext } from "./Effect";
import {
  getRandomHexColor,
  getRandomInt,
  getRandomElement,
  getComplementaryColor,
  getFamilyColor,
  getAnalogousColor,
} from "../utils";

export class BackgroundColorEffect extends Effect {
  name = "BackgroundColor";

  constructor(occurrenceProbability = 0.6) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply() || context.shared.bgData?.hasBgImg) return null;

    let bgColor: string;
    const color1 = getRandomHexColor();
    // const color2 = getFamilyColor(color1, getRandomInt(60, 220));
    const color2 = getRandomHexColor();
    const type = getRandomInt(1, 3);

    if (type === 1 || Math.random() < 0.4) {
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

    context.shared.bgData = { hasBgImg: false, bgColor: [color1, color2] };
    return [{ property: "background", value: bgColor }];
  }
}

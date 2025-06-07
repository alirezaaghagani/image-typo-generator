import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import { getRandomInt } from "../utils.js";

export class RotationEffect extends Effect {
  name = "Rotate";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;

    const angle = (Math.random() - 0.5) * 16;

    return [{ property: "rotate", value: `${angle}deg` }];
  }
}

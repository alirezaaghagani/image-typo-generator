import { Effect, StyleProperty, EffectContext } from "./Effect.js";

export class RotationEffect extends Effect {
  name = "Rotate";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    const angle = (Math.random() - 0.5) * 16;

    return [{ property: "rotate", value: `${angle}deg` }];
  }
}

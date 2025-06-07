import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import { getRandomElement } from "../utils.js";

export class FontWeightEffect extends Effect {
  name = "FontWeight";
  private weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  constructor(occurrenceProbability = 0.5) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;
    return [
      {
        property: "font-weight",
        value: String(getRandomElement(this.weights)),
      },
    ];
  }
}

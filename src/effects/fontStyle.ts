import { Effect, StyleProperty, EffectContext } from "./Effect.js";
import { getRandomElement } from "../utils.js";

export class FontStyleEffect extends Effect {
  name = "FontStyle";
  private styles = ["italic", "oblique"];

  constructor(occurrenceProbability = 0.1) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;
    return [{ property: "font-style", value: getRandomElement(this.styles) }];
  }
}

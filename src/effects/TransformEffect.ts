import { Effect, StyleProperty, EffectContext } from "./Effect";
import { getRandomInt } from "../utils";

export class TransformEffect extends Effect {
  name = "Transform";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    if (!this.shouldApply()) return null;
    const verticalTranslate = (Math.random() - 0.5) * 55;
    const horizontalTranslate = (Math.random() - 0.5) * 45;

    return [
      {
        property: "transform",
        value: `translate(${horizontalTranslate}%, ${verticalTranslate}%)`,
      },
    ];
  }
}

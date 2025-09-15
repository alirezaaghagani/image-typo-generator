import { Effect, StyleProperty, EffectContext } from "./Effect.js";

export class TransformEffect extends Effect {
  name = "Transform";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  getCss(context: EffectContext): StyleProperty[] | null {
    const verticalTranslate = (Math.random() - 0.5) * 30;
    const horizontalTranslate = (Math.random() - 0.5) * 35;

    return [
      {
        property: "transform",
        value: `translate(${horizontalTranslate}%, ${verticalTranslate}%)`,
      },
    ];
  }
}

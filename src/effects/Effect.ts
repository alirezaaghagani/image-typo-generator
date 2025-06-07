export interface StyleProperty {
  property: string;
  value: string;
}

export interface EffectContext {
  imageWidth: number;
  imageHeight: number;
  textContent: string;
  fontFamily: string;
  shared: {
    imageFiles: string[];
    textColor?: string;
    backgroundImageUrl?: string;
    backgroundColor?: string;
    backgroundType?: "color" | "image";
  };
}

export abstract class Effect {
  abstract name: string;
  protected occurrenceProbability: number; // 0.0 to 1.0

  constructor(occurrenceProbability = 0.5) {
    this.occurrenceProbability = occurrenceProbability;
  }

  /**
   * Determines if the effect should be applied based on its probability.
   */
  shouldApply(): boolean {
    return Math.random() < this.occurrenceProbability;
  }

  /**
   * Returns an array of CSS StyleProperty objects or null if the effect shouldn't be applied
   * or doesn't generate any styles.
   * @param context - Contextual information that might be needed for style generation.
   */
  abstract getCss(
    context: EffectContext
  ): Promise<StyleProperty[] | null> | StyleProperty[] | null;
}

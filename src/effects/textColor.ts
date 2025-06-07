import { Effect, StyleProperty, EffectContext } from "./Effect";
import {
  getComplementaryColor,
  getRandomHexColor,
  getReadableTextColorFromTopColors,
  getTopColors,
} from "../utils";
import { join } from "path";

const IMAGE_DIR = join(process.cwd(), "assets", "images");

// 1. common colors with weights
const commonColors = [
  { color: "#000000", weight: 16 }, // Black – most common
  { color: "#FFFFFF", weight: 3 },
  { color: "#333333", weight: 6 },
  { color: "#666666", weight: 5 },
  { color: "#999999", weight: 4 },
  { color: "#FF0000", weight: 2 },
  { color: "#FF6600", weight: 2 },
  { color: "#FFD700", weight: 1 },
  { color: "#FFFF00", weight: 1 },
  { color: "#008000", weight: 2 },
  { color: "#00FFFF", weight: 1 },
  { color: "#0000FF", weight: 2 },
  { color: "#1E90FF", weight: 1 },
  { color: "#800080", weight: 1 },
  { color: "#FF69B4", weight: 1 },
  { color: "#FFA500", weight: 2 },
  { color: "#C0C0C0", weight: 1 },
  { color: "#E6E6FA", weight: 1 },
  { color: "#F5F5F5", weight: 1 },
  { color: "#B22222", weight: 1 },
  { color: "#FF80ED", weight: 1 },
  { color: "#065535", weight: 1 },
  { color: "#133337", weight: 1 },
  { color: "#FFC0CB", weight: 1 },
  { color: "#FFE4E1", weight: 1 },
  { color: "#008080", weight: 1 },
  { color: "#C6E2FF", weight: 1 },
  { color: "#B0E0E6", weight: 1 },
  { color: "#40E0D0", weight: 1 },
  { color: "#D3FFCE", weight: 1 },
];

// 2. Weighted random picker
function getWeightedRandomColor() {
  const totalWeight = commonColors.reduce((sum, c) => sum + c.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const c of commonColors) {
    if (rand < c.weight) return c.color;
    rand -= c.weight;
  }
  // fallback
  return commonColors[0].color;
}

export class TextColorEffect extends Effect {
  name = "TextColor";

  constructor(occurrenceProbability: number) {
    super(occurrenceProbability);
  }

  async getCss(context: EffectContext): Promise<StyleProperty[] | null> {
    let color: string;
    switch (context.shared.backgroundType) {
      case "image":
        const imagePath = join(IMAGE_DIR, context.shared.backgroundImageUrl!);
        const topColors = await getTopColors(imagePath, 3);
        color = getReadableTextColorFromTopColors(topColors);
        break;
      case "color":
      default:
        const bgColor = context.shared.backgroundColor || "#fff";
        color = getComplementaryColor(bgColor);
        if (Math.random() < 0.15) {
          // 30% chance to pick a random hex color
          // ? color = getWeightedRandomColor();
        }
        break;
    }

    context.shared.textColor = color;
    return [{ property: "color", value: color }];
  }
}

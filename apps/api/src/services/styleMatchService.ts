import { prisma } from '../config/database';
import { TattooStyle } from '@inksync/shared';

const STYLE_KEYWORDS: Record<TattooStyle, string[]> = {
  [TattooStyle.TRADITIONAL]: ['traditional', 'old school', 'bold', 'classic', 'eagle', 'panther', 'rose'],
  [TattooStyle.NEO_TRADITIONAL]: ['neo traditional', 'neo-traditional', 'illustrative', 'bold lines', 'vivid'],
  [TattooStyle.REALISM]: ['realism', 'realistic', 'portrait', 'photorealistic', 'detailed', 'shading'],
  [TattooStyle.WATERCOLOR]: ['watercolor', 'watercolour', 'splash', 'paint', 'colorful', 'bleed'],
  [TattooStyle.BLACKWORK]: ['blackwork', 'black', 'solid', 'dotwork', 'geometric', 'mandala'],
  [TattooStyle.TRIBAL]: ['tribal', 'polynesian', 'maori', 'aztec', 'indigenous', 'cultural'],
  [TattooStyle.JAPANESE]: ['japanese', 'irezumi', 'koi', 'dragon', 'oni', 'samurai', 'chrysanthemum'],
  [TattooStyle.GEOMETRIC]: ['geometric', 'geometry', 'symmetry', 'sacred', 'lines', 'shapes'],
  [TattooStyle.MINIMALIST]: ['minimalist', 'minimal', 'simple', 'fine line', 'delicate', 'small'],
  [TattooStyle.ILLUSTRATIVE]: ['illustrative', 'illustration', 'sketch', 'artistic', 'drawing'],
  [TattooStyle.OTHER]: [],
};

export function classifyStyleFromDescription(description: string): { style: TattooStyle; confidence: number } {
  const lowerDesc = description.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lowerDesc.includes(kw)) score += 1;
    }
    scores[style] = score;
  }

  const topStyle = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const totalMatches = Object.values(scores).reduce((s, v) => s + v, 0);
  const confidence = totalMatches > 0 ? topStyle[1] / totalMatches : 0;

  return {
    style: (topStyle[1] > 0 ? topStyle[0] : TattooStyle.OTHER) as TattooStyle,
    confidence: Math.round(confidence * 100) / 100,
  };
}

export async function getStyleMatchRecommendations(description: string, query: { page?: number; limit?: number }) {
  const { style, confidence } = classifyStyleFromDescription(description);

  const limit = Math.min(20, query.limit ?? 10);
  const page = Math.max(1, query.page ?? 1);
  const skip = (page - 1) * limit;

  const artists = await prisma.artistProfile.findMany({
    where: {
      isAvailable: true,
      ...(style !== TattooStyle.OTHER ? { styles: { has: style } } : {}),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      portfolioImages: { where: { isPublic: true, style }, take: 3, orderBy: { sortOrder: 'asc' } },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return { detectedStyle: style, confidence, recommendedArtists: artists };
}

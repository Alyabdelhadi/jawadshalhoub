// Pure, deterministic catalog builder.
// Given lists of video & image basenames (no extensions), assign curated media
// to the page's narrative sections. No randomness — fully deterministic so the
// app and the prep pipeline agree.
//
// Sections: hero, challenge, story, achievements, quote, ending
// Rules:
//   - hero.video   = first video
//   - quote.video  = second video (guaranteed different from hero; falls back to
//                    last available video if only two exist, but never === hero)
//   - challenge    >= 2 images
//   - story        >= 4 images (one per milestone: Lebanon, Nepal, EBC, ABC, Record)
//   - achievements >= 5 images
//   - ending       >= 1 image
// Images are distributed by deterministic slicing across the sections.

export const STORY_MILESTONES = ["Lebanon", "Nepal", "EBC", "ABC", "Record"];

export function buildCatalog({ videos = [], images = [] } = {}) {
  if (!Array.isArray(videos) || !Array.isArray(images)) {
    throw new TypeError("buildCatalog expects { videos: string[], images: string[] }");
  }

  const heroVideo = videos[0] ?? null;
  // pick the first video that is not the hero video
  let quoteVideo = videos.find((v) => v !== heroVideo) ?? null;
  if (quoteVideo === null && videos.length > 1) {
    quoteVideo = videos[1];
  }

  // Deterministic slicing of images across sections.
  // Layout (indices into images[]):
  //   challenge:    2 images
  //   story:        5 images (one per milestone)
  //   achievements: remainder, but at least 5
  //   ending:       last image
  const imgs = images.slice();

  let cursor = 0;
  const take = (n) => {
    const out = imgs.slice(cursor, cursor + n);
    cursor += n;
    return out;
  };

  const challenge = take(2);
  const story = take(STORY_MILESTONES.length); // 5

  // Reserve 1 image for ending, give the rest to achievements (>= 5).
  const remaining = imgs.slice(cursor);
  const ending = remaining.length > 0 ? [remaining[remaining.length - 1]] : [];
  const achievements = remaining.length > 1 ? remaining.slice(0, remaining.length - 1) : remaining.slice();

  return {
    hero: { video: heroVideo },
    challenge: { images: challenge },
    story: {
      milestones: STORY_MILESTONES.map((name, i) => ({ name, image: story[i] ?? null })),
      images: story,
    },
    achievements: { images: achievements },
    quote: { video: quoteVideo },
    ending: { images: ending },
  };
}

export default buildCatalog;

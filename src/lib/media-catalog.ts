// Strongly-typed media catalog consumed by the React app.
//
// All paths are web paths under /media/... (produced by scripts/prep-media.mjs),
// NOT the raw /assests/... source files. Image `src` points at the 1280px webp;
// `srcSet` lists the 640/1280/1920 variants for responsive loading.
//
// The section->media assignment mirrors the deterministic logic in
// scripts/prep-catalog.mjs, but with hand-curated basenames chosen for narrative
// fit (Lebanon waterfalls, Nepal trek, snow camps, expedition portraits).

export type MediaImage = { src: string; srcSet: string; alt: string };
export type MediaVideo = { mp4: string; webm: string; poster: string };
export type MediaCatalog = {
  hero: { video: MediaVideo };
  challenge: { kilimanjaro: MediaImage; elbrus: MediaImage };
  story: { milestones: MediaImage[] }; // >= 4
  achievements: { images: MediaImage[] }; // >= 5
  quote: { video: MediaVideo };
  ending: { summit: MediaImage };
};

const IMG_WIDTHS = [640, 1280, 1920] as const;
type ImgWidth = (typeof IMG_WIDTHS)[number];

// A few source photos are narrower than 1920px, so prep-media.mjs never wrote a
// 1920 variant for them (no upscaling). Listing those widths in srcSet anyway
// would 404 on wide / high-DPR screens, so we override the available widths.
const WIDTH_OVERRIDES: Record<string, readonly ImgWidth[]> = {
  image00027: [640, 1280],
};

function img(basename: string, alt: string): MediaImage {
  const url = (w: number) => `/media/img/${basename}-${w}.webp`;
  const widths = WIDTH_OVERRIDES[basename] ?? IMG_WIDTHS;
  return {
    // src is always the 1280 variant (present for every image).
    src: url(1280),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    alt,
  };
}

function video(basename: string): MediaVideo {
  return {
    mp4: `/media/video/${basename}.mp4`,
    webm: `/media/video/${basename}.webm`,
    poster: `/media/video/${basename}-poster.webp`,
  };
}

// Curated basenames (extensionless). Source videos: IMG_6116, IMG_2586, IMG_0303,
// IMG_1833, IMG_2587. IMG_6116 is the hero clip; IMG_2586 backs the quote.
export const catalog: MediaCatalog = {
  hero: {
    video: video("IMG_6116"),
  },
  challenge: {
    kilimanjaro: img(
      "kilimanjaro",
      "Mount Kilimanjaro — the snow-capped summit rising above the African plains"
    ),
    elbrus: img(
      "elbrus",
      "Mount Elbrus — the twin snow-covered peaks of Europe's highest mountain"
    ),
  },
  story: {
    milestones: [
      img("image00011", "Lebanon — at the start of the expedition journey"),
      img("image00015", "Nepal — trekking the valley toward Annapurna's snow peaks"),
      img("image00010", "Everest Base Camp — climbing a rock face under a starlit summit"),
      img("image00029", "Annapurna Base Camp — crossing glacial waters by boat"),
      img("image00025", "Record attempt — standing on the high plateau at golden hour"),
    ],
  },
  achievements: {
    images: [
      img("image00011", "Expedition portrait on rugged mountain terrain"),
      img("image00005", "Standing before a sunlit waterfall in the Lebanese highlands"),
      img("image00012", "High-altitude trekking with full expedition pack"),
      img("image00017", "Resting at a remote alpine camp"),
      img("image00022", "Traversing a snowbound ridge line"),
      img("image00027", "Golden-hour hike across open highland grasslands"),
    ],
  },
  quote: {
    video: video("IMG_2586"),
  },
  ending: {
    summit: img("image00015", "Looking out toward the Annapurna massif at the journey's end"),
  },
};

export default catalog;

import { describe, it, expect } from "vitest";
import { buildCatalog } from "../prep-catalog.mjs";

describe("buildCatalog", () => {
  it("assigns a hero video and never reuses it elsewhere", () => {
    const c = buildCatalog({
      videos: ["IMG_6116", "IMG_2586", "IMG_0303"],
      images: Array.from({ length: 29 }, (_, i) => `image${String(i + 1).padStart(5, "0")}`),
    });
    expect(c.hero.video).toBeTruthy();
    expect(c.quote.video).toBeTruthy();
    expect(c.hero.video).not.toBe(c.quote.video);
    expect(c.achievements.images.length).toBeGreaterThanOrEqual(5);
  });
});

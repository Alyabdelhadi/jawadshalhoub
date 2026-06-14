// All site copy lives here so sections import strings from a single source.
// Everything is `as const` for literal typing.

export const HERO = {
  headlineLines: [
    "Two Continents.",
    "Two Summits.",
    "One World Record Attempt.",
  ],
  subhead:
    "At just 23 years old, Jawad Shalhoub is preparing for one of the most ambitious adventure challenges ever attempted.",
  ctaPrimary: "Follow The Journey",
  ctaSecondary: "Become A Sponsor",
} as const;

export const MOUNTAINS = [
  { name: "Mount Kilimanjaro", altitude: 5895, continent: "Africa" },
  { name: "Mount Elbrus", altitude: 5642, continent: "Europe" },
] as const;

export const CHALLENGE_HEADLINE =
  "The First Person Ever To Attempt This Two-Continent Summit Challenge In Record Time" as const;

export const STORY = {
  heading: "From Lebanon To The Himalayas",
  intro:
    "In November 2025, Jawad became the first Lebanese ever to complete both Everest Base Camp and Annapurna Base Camp in Nepal in only 11 days.",
  milestones: [
    {
      id: "lebanon",
      title: "Lebanon",
      blurb:
        "Where it began — forging strength and grit on the rugged peaks and waterfalls of his homeland.",
    },
    {
      id: "nepal",
      title: "Nepal",
      blurb:
        "Answering the call of the Himalayas, trekking into the highest mountains on Earth.",
    },
    {
      id: "everest-base-camp",
      title: "Everest Base Camp",
      blurb:
        "Standing at the foot of the world's tallest mountain, the first Lebanese to make the journey.",
    },
    {
      id: "annapurna-base-camp",
      title: "Annapurna Base Camp",
      blurb:
        "Two iconic base camps conquered in just 11 days — an endurance feat few have matched.",
    },
    {
      id: "world-record-attempt",
      title: "World Record Attempt",
      blurb:
        "Now the eyes turn to Africa and Europe — a two-continent summit challenge never attempted before.",
    },
  ],
} as const;

export const ACHIEVEMENTS = [
  "First Lebanese to complete Everest Base Camp and Annapurna Base Camp in 11 days",
  "Extreme endurance athlete and adventurer",
  "Multiple mountain and outdoor challenges completed in Lebanon",
  "Representing Lebanon on international expeditions",
  "Preparing for a world-first two-continent summit challenge",
] as const;

export const RECORD = {
  counters: {
    totalElevationM: 11537, // 5895 (Kilimanjaro) + 5642 (Elbrus)
    distanceKm: 6200, // estimated travel distance between continents
    summitDate: "2026-09-01",
  },
  legs: [
    {
      id: "lebanon",
      label: "Lebanon",
      continent: "Asia",
      note: "Home — the starting line.",
    },
    {
      id: "kilimanjaro",
      label: "Mount Kilimanjaro",
      continent: "Africa",
      note: "5,895m — the roof of Africa.",
    },
    {
      id: "elbrus",
      label: "Mount Elbrus",
      continent: "Europe",
      note: "5,642m — the highest peak in Europe.",
    },
  ],
} as const;

export const QUOTE = {
  line1:
    "I don't climb mountains because they are there. I climb them to discover how far determination can take me.",
  manifesto: [
    "For the history books.",
    "For the Lebanese flag.",
    "For a nation that deserves to be proud.",
  ],
} as const;

export const SPONSOR = {
  heading: "Become A Sponsor",
  copy: "Join me on a world-first adventure to the highest peaks of Europe and Africa.",
  body: "Your support—whether financial, equipment, services, or logistics—helps turn this challenge into reality while giving your brand exposure through content, media coverage, and expedition updates. No contribution is too small. Every partner becomes part of the journey.",
  types: ["Financial", "Equipment", "Services", "Logistics", "Other"],
  cta: "Become A Sponsor",
} as const;

export const ENDING = {
  headline: "The Journey Begins Summer 2026",
  subhead: "Follow The Expedition.",
  cta: "Support The Mission",
} as const;

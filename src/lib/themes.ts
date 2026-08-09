/** Theme class names applied via next-themes `attribute="class"`. */
export const THEMES = [
  "command",
  "midnight",
  "arctic",
  "ember",
  "graphite",
  "signal",
  "sandstorm",
  "iceberg",
  "terminal",
  "copper",
  "slate",
] as const;

export type ThemeName = (typeof THEMES)[number];

export type ThemeOption = ThemeName | "system";

export const THEME_OPTIONS: ThemeOption[] = ["system", ...THEMES];

export const THEME_META: Record<
  ThemeOption,
  { label: string; swatch: string; description: string }
> = {
  system: {
    label: "Auto",
    swatch: "linear-gradient(135deg,#e8eef5 50%,#0c1218 50%)",
    description: "Follow OS preference",
  },
  command: {
    label: "Command",
    swatch: "#0b1410",
    description: "Ops green / amber briefing",
  },
  midnight: {
    label: "Midnight",
    swatch: "#08111f",
    description: "Deep navy watch floor",
  },
  arctic: {
    label: "Arctic",
    swatch: "#eef3f8",
    description: "Bright daylight ops",
  },
  ember: {
    label: "Ember",
    swatch: "#160e0c",
    description: "Alert red / charcoal",
  },
  graphite: {
    label: "Graphite",
    swatch: "#121212",
    description: "Monochrome precision",
  },
  signal: {
    label: "Signal",
    swatch: "#05080c",
    description: "Cyan on near-black",
  },
  sandstorm: {
    label: "Sandstorm",
    swatch: "#c9b896",
    description: "Dusty field briefing",
  },
  iceberg: {
    label: "Iceberg",
    swatch: "#d9e8f2",
    description: "Cool blue-white",
  },
  terminal: {
    label: "Terminal",
    swatch: "#07140c",
    description: "Classic green CRT",
  },
  copper: {
    label: "Copper",
    swatch: "#1a120e",
    description: "Industrial metal",
  },
  slate: {
    label: "Slate",
    swatch: "#12161c",
    description: "Cool industrial gray",
  },
};

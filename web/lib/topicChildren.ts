export type ChildLink = { href: string; label: string };

export function getChildLinks(appSubPath: string): ChildLink[] {
  const entries: ChildLink[] = [];
  const toTitle = (s: string) =>
    s.split("-").map((w: string) => (w ? w[0].toUpperCase() + w.slice(1) : "")).join(" ");
  // TODO: Gerekirse appSubPath'e özel mapping ekleyebilirsin.
  return entries;
}

export default getChildLinks;

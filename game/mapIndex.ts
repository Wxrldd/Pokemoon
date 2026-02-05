export type MapPoint = {
  slug: string;
  x: number;
  y: number;
};

export function buildGridLayout(slugs: string[], spacing = 160): Map<string, MapPoint> {
  const sorted = [...slugs].sort((a, b) => a.localeCompare(b));
  const n = sorted.length;
  const cols = Math.max(8, Math.ceil(Math.sqrt(n)));

  const map = new Map<string, MapPoint>();
  for (let i = 0; i < n; i++) {
    const slug = sorted[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    map.set(slug, { slug, x: col * spacing, y: row * spacing });
  }
  return map;
}

export function getBounds(points: Iterable<MapPoint>) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

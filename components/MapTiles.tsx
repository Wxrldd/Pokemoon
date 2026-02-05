import { useMemo } from "react";

type Props = {
  viewport: { x: number; y: number; w: number; h: number };
  chunkSize: number;
  tileSize: number;
  loadedChunks: Set<string>;
};

function chunkKey(cx: number, cy: number) {
  return `${cx},${cy}`;
}

export default function MapTiles({ viewport, chunkSize, tileSize, loadedChunks }: Props) {
  const tiles = useMemo(() => {
    const x0 = Math.floor(viewport.x / tileSize) - 2;
    const y0 = Math.floor(viewport.y / tileSize) - 2;
    const x1 = Math.ceil((viewport.x + viewport.w) / tileSize) + 2;
    const y1 = Math.ceil((viewport.y + viewport.h) / tileSize) + 2;

    const list: Array<{ x: number; y: number }> = [];
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const worldX = tx * tileSize;
        const worldY = ty * tileSize;

        const cx = Math.floor(worldX / chunkSize);
        const cy = Math.floor(worldY / chunkSize);

        if (!loadedChunks.has(chunkKey(cx, cy))) continue;
        list.push({ x: worldX, y: worldY });
      }
    }
    return list;
  }, [viewport, chunkSize, tileSize, loadedChunks]);

  return (
    <>
      {tiles.map((t) => (
        <div
          key={`${t.x},${t.y}`}
          style={{
            position: "absolute",
            left: t.x,
            top: t.y,
            width: tileSize,
            height: tileSize,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            boxSizing: "border-box",
          }}
        />
      ))}
    </>
  );
}

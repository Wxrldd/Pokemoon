import { useMemo } from "react";
import type { MapPoint } from "../game/mapIndex";

type Props = {
  points: MapPoint[];
  viewport: { x: number; y: number; w: number; h: number };
  onSelect: (slug: string) => void;
  selected?: string | null;
};

export default function MapOverlay({ points, viewport, onSelect, selected }: Props) {
  const visible = useMemo(() => {
    const pad = 120;
    const x0 = viewport.x - pad;
    const y0 = viewport.y - pad;
    const x1 = viewport.x + viewport.w + pad;
    const y1 = viewport.y + viewport.h + pad;

    return points.filter((p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1);
  }, [points, viewport]);

  return (
    <>
      {visible.map((p) => (
        <button
          key={p.slug}
          onClick={() => onSelect(p.slug)}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            transform: "translate(-50%, -50%)",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: selected === p.slug ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.35)",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
          title={p.slug}
        >
          {p.slug}
        </button>
      ))}
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MapTiles from "./MapTiles";
import MapOverlay from "../components/MapOverlay";
import { buildGridLayout, getBounds, type MapPoint } from "../game/mapIndex";
import { getRegionLocations, getPokemonImage, resolveLocationArea } from "../game/pokeapi";
import { getAreaEncountersFromPokeAPI } from "../game/encounters";
import { stepEncounter, type WildRoll } from "../game/encounterEngine";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

type Props = {
  region: string;
  version: string;
  method: string;
};

export default function WorldMap({ region, version, method }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [slugs, setSlugs] = useState<string[]>([]);
  const layout = useMemo(() => buildGridLayout(slugs, 160), [slugs]);

  const points: MapPoint[] = useMemo(() => [...layout.values()], [layout]);
  const bounds = useMemo(() => getBounds(points), [points]);

  const chunkSize = 800;
  const tileSize = 100;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set(["0,0"]));

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [encounterRate, setEncounterRate] = useState<number | null>(null);
  const [zonePokemon, setZonePokemon] = useState<
    Array<{ name: string; weight: number; minLevel: number; maxLevel: number }>
  >([]);
  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState<WildRoll[]>([]);
  const [cards, setCards] = useState<Record<string, string | null>>({});

  const [drag, setDrag] = useState<null | { sx: number; sy: number; px: number; py: number }>(null);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      setErr(null);
      try {
        const locs = await getRegionLocations(region);
        if (cancelled) return;
        setSlugs(locs);

        const b = getBounds(buildGridLayout(locs, 160).values());
        const pad = 300;
        const centerX = (b.minX + b.maxX) / 2;
        const centerY = (b.minY + b.maxY) / 2;
        setPan({ x: -centerX + pad, y: -centerY + pad });
        setZoom(1);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Erreur inconnue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [region]);

  const viewport = useMemo(() => {
    const el = containerRef.current;
    const w = el?.clientWidth ?? 800;
    const h = el?.clientHeight ?? 600;
    const worldX = (-pan.x) / zoom;
    const worldY = (-pan.y) / zoom;
    const worldW = w / zoom;
    const worldH = h / zoom;
    return { x: worldX, y: worldY, w: worldW, h: worldH };
  }, [pan.x, pan.y, zoom]);

  useEffect(() => {
    const cx0 = Math.floor(viewport.x / chunkSize) - 1;
    const cy0 = Math.floor(viewport.y / chunkSize) - 1;
    const cx1 = Math.floor((viewport.x + viewport.w) / chunkSize) + 1;
    const cy1 = Math.floor((viewport.y + viewport.h) / chunkSize) + 1;

    setLoadedChunks((prev) => {
      const next = new Set(prev);
      for (let cy = cy0; cy <= cy1; cy++) {
        for (let cx = cx0; cx <= cx1; cx++) {
          next.add(`${cx},${cy}`);
        }
      }
      return next;
    });
  }, [viewport.x, viewport.y, viewport.w, viewport.h]);

  useEffect(() => {
    let cancelled = false;
    async function loadZone() {
      if (!selectedLocation) return;

      setSelectedArea(null);
      setEncounterRate(null);
      setZonePokemon([]);
      setRoll([]);
      setCards({});

      try {
        const areaName = await resolveLocationArea(selectedLocation);
        if (cancelled) return;
        setSelectedArea(areaName);

        const area = await getAreaEncountersFromPokeAPI({ areaName, version, method });
        if (cancelled) return;

        setEncounterRate(area.encounterRate);
        const list = [...area.slots]
          .map((s) => ({
            name: s.name,
            weight: s.weight,
            minLevel: s.minLevel,
            maxLevel: s.maxLevel,
          }))
          .sort((a, b) => b.weight - a.weight);
        setZonePokemon(list);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Erreur inconnue");
      }
    }
    loadZone();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation, version, method]);

  async function doRoll() {
    if (!selectedLocation) return;
    setRolling(true);
    setErr(null);
    try {
      const areaName = selectedArea ?? (await resolveLocationArea(selectedLocation));
      setSelectedArea(areaName);

      let tries = 0;
      let result: WildRoll[] = [];
      while (result.length === 0 && tries < 2000) {
        tries++;
        result = await stepEncounter({ areaName, version, method });
      }
      setRoll(result);

      const unique = Array.from(new Set(result.map((r) => r.name)));
      const imgs = await Promise.all(unique.map(async (n) => [n, await getPokemonImage(n)] as const));
      setCards(Object.fromEntries(imgs));
    } catch (e: any) {
      setErr(e?.message ?? "Erreur inconnue");
    } finally {
      setRolling(false);
    }
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const worldX = (mx - pan.x) / zoom;
    const worldY = (my - pan.y) / zoom;

    const dir = e.deltaY > 0 ? -1 : 1;
    const nextZoom = clamp(zoom * (dir > 0 ? 1.12 : 0.89), 0.25, 3);

    const nextPanX = mx - worldX * nextZoom;
    const nextPanY = my - worldY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setDrag({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drag) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    setPan({ x: drag.px + dx, y: drag.py + dy });
  }

  function onMouseUp() {
    setDrag(null);
  }

  const visiblePoints = useMemo(() => points, [points]);

  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Map — {region}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
        <div
          ref={containerRef}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            height: 720,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            position: "relative",
            background: "rgba(0,0,0,0.35)",
            userSelect: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: pan.x,
              top: pan.y,
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
              width: Math.max(bounds.maxX - bounds.minX + 2000, 4000),
              height: Math.max(bounds.maxY - bounds.minY + 2000, 4000),
            }}
          >
            <MapTiles viewport={viewport} chunkSize={chunkSize} tileSize={tileSize} loadedChunks={loadedChunks} />
            <MapOverlay
              points={visiblePoints}
              viewport={viewport}
              selected={selectedLocation}
              onSelect={(slug) => setSelectedLocation(slug)}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 10,
              top: 10,
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 12,
            }}
          >
            <div>Zoom: {zoom.toFixed(2)}</div>
            <div>Chunks chargés: {loadedChunks.size}</div>
          </div>
        </div>

        <aside
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            padding: 12,
            background: "rgba(0,0,0,0.25)",
            height: 720,
            overflow: "auto",
          }}
        >
          {loading && <div>Chargement région…</div>}
          {err && <div style={{ marginTop: 8 }}><strong>{err}</strong></div>}

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Version: <strong>{version}</strong> — Méthode: <strong>{method}</strong>
          </div>

          <hr style={{ margin: "12px 0", opacity: 0.15 }} />

          <div style={{ fontWeight: 800, marginBottom: 8 }}>Zone sélectionnée</div>
          {!selectedLocation && <div style={{ opacity: 0.8 }}>Clique un lieu sur la carte.</div>}

          {selectedLocation && (
            <>
              <div>
                Lieu: <strong>{titleizeSlug(selectedLocation)}</strong>
              </div>
              {selectedArea && (
                <div style={{ marginTop: 6 }}>
                  location-area: <strong>{selectedArea}</strong>
                </div>
              )}
              {encounterRate !== null && (
                <div style={{ marginTop: 6 }}>
                  Taux d’apparition: <strong>{Math.round(encounterRate * 100)}%</strong>
                </div>
              )}

              <button
                onClick={doRoll}
                disabled={rolling || !selectedArea}
                style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, cursor: "pointer" }}
              >
                {rolling ? "Rencontre…" : "Rencontrer des Pokémon"}
              </button>

              <hr style={{ margin: "12px 0", opacity: 0.15 }} />

              <div style={{ fontWeight: 800, marginBottom: 8 }}>Pokémon possibles</div>
              {zonePokemon.length === 0 ? (
                <div style={{ opacity: 0.8 }}>Aucun (ou pas de data pour cette méthode/version).</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ textAlign: "left", opacity: 0.85 }}>
                        <th style={{ padding: "6px 4px" }}>Pokémon</th>
                        <th style={{ padding: "6px 4px" }}>Poids</th>
                        <th style={{ padding: "6px 4px" }}>Niveaux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zonePokemon.slice(0, 40).map((p) => (
                        <tr key={p.name} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={{ padding: "6px 4px" }}>{titleizeSlug(p.name)}</td>
                          <td style={{ padding: "6px 4px" }}>{p.weight}</td>
                          <td style={{ padding: "6px 4px" }}>
                            {p.minLevel}–{p.maxLevel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {zonePokemon.length > 40 && (
                    <div style={{ marginTop: 6, opacity: 0.7 }}>
                      (+{zonePokemon.length - 40} autres…)
                    </div>
                  )}
                </div>
              )}

              <hr style={{ margin: "12px 0", opacity: 0.15 }} />

              <div style={{ fontWeight: 800, marginBottom: 8 }}>Dernière rencontre</div>
              {roll.length === 0 ? (
                <div style={{ opacity: 0.8 }}>Aucune</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  {roll.map((r, i) => (
                    <div
                      key={`${r.name}-${i}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.10)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cards[r.name] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cards[r.name] as string}
                            alt={r.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <div style={{ opacity: 0.7, fontSize: 12 }}>No image</div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800 }}>{titleizeSlug(r.name)}</div>
                        <div style={{ opacity: 0.8 }}>Niveau {r.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

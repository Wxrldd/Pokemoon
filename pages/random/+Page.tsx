"use client";

import { useEffect, useMemo, useState } from "react";
import { stepEncounter, type WildRoll } from "../../game/encounterEngine";
import { getAreaEncountersFromPokeAPI } from "../../game/encounters";

type RegionResponse = {
  locations: Array<{ name: string; url: string }>;
};

type LocationResponse = {
  areas: Array<{ name: string }>;
};

type PokemonResponse = {
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      [k: string]: any;
      "official-artwork"?: { front_default: string | null };
    };
  };
};

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export default function RandomPage() {
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [regionError, setRegionError] = useState<string | null>(null);

  const [locations, setLocations] = useState<string[]>([]);
  const [locationName, setLocationName] = useState<string>("hoenn-route-101");

  const [zoneListLoading, setZoneListLoading] = useState(false);
  const [zonePokemon, setZonePokemon] = useState<
    Array<{ name: string; weight: number; minLevel: number; maxLevel: number }>
  >([]);
  const [zoneInfoError, setZoneInfoError] = useState<string | null>(null);

  const [result, setResult] = useState<WildRoll[]>([]);
  const [cards, setCards] = useState<Record<string, { img: string | null }>>({});
  const [rate, setRate] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number | null>(null);
  const [resolvedArea, setResolvedArea] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const version = "emerald";
  const method = "walk";
  const region = "hoenn";

  const sortedLocations = useMemo(() => {
    const arr = [...locations];
    arr.sort((a, b) => a.localeCompare(b));
    return arr;
  }, [locations]);

  async function resolveAreaName(loc: string) {
    const res = await fetch(`https://pokeapi.co/api/v2/location/${loc}/`);
    if (!res.ok) throw new Error("Location introuvable (slug incorrect)");
    const data = (await res.json()) as LocationResponse;
    const areaName = data.areas?.[0]?.name;
    if (!areaName) throw new Error("Aucune location-area trouvée pour ce lieu");
    return areaName;
  }

  async function fetchPokemonCard(pokemonName: string) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
    if (!res.ok) return { img: null };
    const data = (await res.json()) as PokemonResponse;

    const official =
      data.sprites?.other?.["official-artwork"]?.front_default ?? null;
    const fallback = data.sprites?.front_default ?? null;
    return { img: official ?? fallback };
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRegionLocations() {
      setBootLoading(true);
      setRegionError(null);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/region/${region}/`);
        if (!res.ok) throw new Error("Impossible de charger la région");
        const data = (await res.json()) as RegionResponse;
        const list = (data.locations ?? []).map((l) => l.name);
        if (!cancelled) {
          setLocations(list);
          if (list.length && !list.includes(locationName)) {
            setLocationName(list[0]);
          }
        }
      } catch (e: any) {
        if (!cancelled) setRegionError(e?.message ?? "Erreur inconnue");
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    }

    loadRegionLocations();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  useEffect(() => {
    let cancelled = false;

    async function loadZonePokemon() {
      setZoneListLoading(true);
      setZonePokemon([]);
      setZoneInfoError(null);
      setResolvedArea(null);
      setRate(null);

      try {
        const areaName = await resolveAreaName(locationName);
        if (cancelled) return;
        setResolvedArea(areaName);

        const area = await getAreaEncountersFromPokeAPI({
          areaName,
          version,
          method,
        });

        if (cancelled) return;
        setRate(area.encounterRate);

        const list = [...area.slots]
          .map((s) => ({
            name: s.name,
            weight: s.weight,
            minLevel: s.minLevel,
            maxLevel: s.maxLevel,
          }))
          .sort((a, b) => b.weight - a.weight);

        if (!cancelled) setZonePokemon(list);
      } catch (e: any) {
        if (!cancelled) setZoneInfoError(e?.message ?? "Erreur inconnue");
      } finally {
        if (!cancelled) setZoneListLoading(false);
      }
    }

    if (!bootLoading && !regionError && locationName) {
      loadZonePokemon();
    }

    return () => {
      cancelled = true;
    };
  }, [bootLoading, regionError, locationName, version, method]);

  async function handleRandom() {
    setLoading(true);
    setResult([]);
    setCards({});
    setAttempts(null);
    setError(null);

    try {
      const areaName = resolvedArea ?? (await resolveAreaName(locationName));
      setResolvedArea(areaName);

      let roll: WildRoll[] = [];
      let tries = 0;
      const MAX_TRIES = 2000;

      while (roll.length === 0 && tries < MAX_TRIES) {
        tries++;
        roll = await stepEncounter({ areaName, version, method });
      }

      setAttempts(tries);

      if (roll.length === 0) {
        setError(
          "Aucune rencontre après beaucoup d’essais. Essaie un autre lieu/méthode/version."
        );
        return;
      }

      setResult(roll);

      const unique = Array.from(new Set(roll.map((r) => r.name)));
      const entries = await Promise.all(
        unique.map(async (name) => [name, await fetchPokemonCard(name)] as const)
      );

      setCards(Object.fromEntries(entries));
    } catch (e: any) {
      setError(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Rencontres (PokeAPI)</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        Région : <strong>{region}</strong> — Version : <strong>{version}</strong> — Méthode : <strong>{method}</strong>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Lieu
          <select
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            disabled={bootLoading || !!regionError}
            style={{ padding: 8, minWidth: 320 }}
          >
            {bootLoading && <option>Chargement…</option>}
            {!bootLoading && sortedLocations.length === 0 && (
              <option>Aucun lieu</option>
            )}
            {sortedLocations.map((loc) => (
              <option key={loc} value={loc}>
                {titleizeSlug(loc)}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={handleRandom}
          disabled={loading || bootLoading || !!regionError || !!zoneInfoError}
          style={{ padding: "10px 14px" }}
        >
          {loading ? "Recherche…" : "Rencontrer des Pokémon"}
        </button>
      </div>

      {regionError && (
        <div style={{ marginTop: 12 }}>
          <strong>{regionError}</strong>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div>
          Lieu (slug) : <strong>{locationName}</strong>
        </div>
        {resolvedArea && (
          <div>
            Location-area : <strong>{resolvedArea}</strong>
          </div>
        )}
        {rate !== null && (
          <div>
            Taux d’apparition : <strong>{Math.round(rate * 100)}%</strong>
          </div>
        )}
        {attempts !== null && (
          <div>
            Tentatives : <strong>{attempts}</strong>
          </div>
        )}
        {zoneInfoError && (
          <div style={{ marginTop: 8 }}>
            <strong>{zoneInfoError}</strong>
          </div>
        )}
        {error && (
          <div style={{ marginTop: 8 }}>
            <strong>{error}</strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Pokémon possibles dans cette zone
          </div>

          {zoneListLoading && <div style={{ opacity: 0.8 }}>Chargement…</div>}

          {!zoneListLoading && zonePokemon.length === 0 && !zoneInfoError && (
            <div style={{ opacity: 0.8 }}>Aucun Pokémon trouvé pour cette zone.</div>
          )}

          {!zoneListLoading && zonePokemon.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", opacity: 0.85 }}>
                    <th style={{ padding: "6px 4px" }}>Pokémon</th>
                    <th style={{ padding: "6px 4px" }}>Poids</th>
                    <th style={{ padding: "6px 4px" }}>Niveaux</th>
                  </tr>
                </thead>
                <tbody>
                  {zonePokemon.map((p) => (
                    <tr
                      key={p.name}
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <td style={{ padding: "6px 4px" }}>{titleizeSlug(p.name)}</td>
                      <td style={{ padding: "6px 4px" }}>{p.weight}</td>
                      <td style={{ padding: "6px 4px" }}>
                        {p.minLevel}–{p.maxLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {result.length === 0 && !loading && !error && (
          <div style={{ opacity: 0.8 }}>Aucune rencontre affichée.</div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {result.map((p, i) => {
            const card = cards[p.name];
            return (
              <div
                key={`${p.name}-${i}`}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255,255,255,0.10)",
                      overflow: "hidden",
                    }}
                  >
                    {card?.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.img}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <div style={{ opacity: 0.7, fontSize: 12 }}>No image</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{titleizeSlug(p.name)}</div>
                    <div style={{ opacity: 0.8 }}>Niveau {p.level}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

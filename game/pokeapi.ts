const API = "https://pokeapi.co/api/v2";

type Named = { name: string; url: string };

type RegionResponse = {
  locations: Named[];
};

type LocationResponse = {
  areas: Named[];
};

const cache = new Map<string, any>();

export async function fetchJson<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit) return hit as T;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

export async function getRegionLocations(region: string): Promise<string[]> {
  const data = await fetchJson<RegionResponse>(`${API}/region/${region}/`);
  return (data.locations ?? []).map((l) => l.name);
}

export async function resolveLocationArea(locationSlug: string): Promise<string> {
  const data = await fetchJson<LocationResponse>(`${API}/location/${locationSlug}/`);
  const area = data.areas?.[0]?.name;
  if (!area) throw new Error("Aucune location-area trouvée pour ce lieu");
  return area;
}

type PokemonResponse = {
  sprites: {
    front_default: string | null;
    other?: {
      ["official-artwork"]?: { front_default: string | null };
      [k: string]: any;
    };
  };
};

export async function getPokemonImage(pokemonName: string): Promise<string | null> {
  const data = await fetchJson<PokemonResponse>(`${API}/pokemon/${pokemonName}/`);
  const official = data.sprites?.other?.["official-artwork"]?.front_default ?? null;
  const fallback = data.sprites?.front_default ?? null;
  return official ?? fallback;
}

export type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  "special-attack": number;
  "special-defense": number;
  speed: number;
};

export type PokemonBattleMove = {
  name: string;
  url: string;
};

export type PokemonDetails = {
  name: string;
  sprites: {
    front_default: string | null;
    other?: { ["official-artwork"]?: { front_default: string | null } };
  };
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  types: Array<{ type: { name: string } }>;
  moves: Array<{
    move: { name: string; url: string };
  }>;
};

export type MoveDetails = {
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: { name: string };
  damage_class: { name: "physical" | "special" | "status" };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
};

export function pickEffectText(move: MoveDetails, prefer: "fr" | "en" = "fr") {
  const pick =
    move.effect_entries.find((e) => e.language.name === prefer) ??
    move.effect_entries.find((e) => e.language.name === "en") ??
    move.effect_entries[0];

  return {
    short: pick?.short_effect ?? "Aucun effet connu.",
    full: pick?.effect ?? "Aucun effet connu.",
  };
}

export async function getPokemonDetails(pokemonName: string): Promise<PokemonDetails> {
  return fetchJson<PokemonDetails>(`${API}/pokemon/${pokemonName.toLowerCase()}/`);
}

export async function getMoveDetails(moveUrlOrName: string): Promise<MoveDetails> {
  const url = moveUrlOrName.startsWith("http")
    ? moveUrlOrName
    : `${API}/move/${moveUrlOrName.toLowerCase()}/`;
  return fetchJson<MoveDetails>(url);
}

export function toStatsMap(details: PokemonDetails): PokemonStats {
  const map: any = {};
  for (const s of details.stats) map[s.stat.name] = s.base_stat;
  return map as PokemonStats;
}

export function getOfficialSprite(details: PokemonDetails): string | null {
  return (
    details.sprites?.other?.["official-artwork"]?.front_default ??
    details.sprites?.front_default ??
    null
  );
}

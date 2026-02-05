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

const BASE = "https://pokeapi.co/api/v2";

type PokemonDetailsApi = {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

async function pokeFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`PokéAPI error ${res.status} on ${path}`);
  return (await res.json()) as T;
}

export type HoverCardDetails = {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

export async function getPokemonHoverCard(nameOrId: string): Promise<HoverCardDetails> {
  const safe = encodeURIComponent(nameOrId.toLowerCase());
  const details = await pokeFetch<PokemonDetailsApi>(`/pokemon/${safe}`);

  const stat = (statName: "hp" | "attack" | "defense" | "speed") =>
    details.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;

  return {
    id: details.id,
    name: details.name,
    types: details.types.map((t) => t.type.name),
    stats: {
      hp: stat("hp"),
      attack: stat("attack"),
      defense: stat("defense"),
      speed: stat("speed"),
    },
  };
}

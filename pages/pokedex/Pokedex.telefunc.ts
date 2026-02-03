const BASE = "https://pokeapi.co/api/v2";

export type PokemonListItem = {
  id: number;
  name: string;
  url: string;
};

export type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      ["official-artwork"]?: { front_default?: string | null };
    };
  };
  types: { slot: number; type: { name: string } }[];
};

async function pokeFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`PokéAPI error ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

async function listPokemonServer(
  limit = 500,
  offset = 0
): Promise<PokemonListItem[]> {
  const data = await pokeFetch<{ results: { name: string; url: string }[] }>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );

  return data.results.map((p) => {
    const id = Number(p.url.split("/").filter(Boolean).pop());
    return { ...p, id };
  });
}

export async function listPokemon(limit = 500, offset = 0) {
  return listPokemonServer(limit, offset);
}

export async function getPokemonByName(nameOrId: string): Promise<PokemonDetails> {
  const safe = encodeURIComponent(nameOrId.toLowerCase());
  return pokeFetch<PokemonDetails>(`/pokemon/${safe}`);
}

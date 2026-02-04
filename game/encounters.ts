export type EncounterSlot = {
  name: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
};

export type AreaEncounters = {
  encounterRate: number;
  slots: EncounterSlot[];
};

const API = "https://pokeapi.co/api/v2";

type NamedAPIResource = { name: string; url: string };

type LocationArea = {
  encounter_method_rates: Array<{
    encounter_method: NamedAPIResource;
    version_details: Array<{
      rate: number;
      version: NamedAPIResource;
    }>;
  }>;
  pokemon_encounters: Array<{
    pokemon: NamedAPIResource;
    version_details: Array<{
      version: NamedAPIResource;
      encounter_details: Array<{
        min_level: number;
        max_level: number;
        chance: number;
        method: NamedAPIResource;
        condition_values: NamedAPIResource[];
      }>;
    }>;
  }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getAreaEncountersFromPokeAPI(opts: {
  areaName: string;
  version: string;
  method: string;
  ignoreConditional?: boolean;
}): Promise<AreaEncounters> {
  const { areaName, version, method, ignoreConditional = true } = opts;

  const area = await fetchJson<LocationArea>(`${API}/location-area/${areaName}/`);

  const rate =
    area.encounter_method_rates
      .find((m) => m.encounter_method.name === method)
      ?.version_details.find((v) => v.version.name === version)?.rate ?? 0;

  const byPokemon = new Map<
    string,
    { weight: number; minLevel: number; maxLevel: number }
  >();

  for (const pe of area.pokemon_encounters) {
    const vd = pe.version_details.find((v) => v.version.name === version);
    if (!vd) continue;

    const details = vd.encounter_details.filter(
      (d) =>
        d.method.name === method &&
        (!ignoreConditional || d.condition_values.length === 0)
    );

    if (details.length === 0) continue;

    const weight = details.reduce((s, d) => s + d.chance, 0);
    const minLevel = Math.min(...details.map((d) => d.min_level));
    const maxLevel = Math.max(...details.map((d) => d.max_level));

    const prev = byPokemon.get(pe.pokemon.name);
    byPokemon.set(pe.pokemon.name, {
      weight: (prev?.weight ?? 0) + weight,
      minLevel: prev ? Math.min(prev.minLevel, minLevel) : minLevel,
      maxLevel: prev ? Math.max(prev.maxLevel, maxLevel) : maxLevel,
    });
  }

  return {
    encounterRate: rate / 100,
    slots: [...byPokemon.entries()].map(([name, v]) => ({
      name,
      weight: v.weight,
      minLevel: v.minLevel,
      maxLevel: v.maxLevel,
    })),
  };
}

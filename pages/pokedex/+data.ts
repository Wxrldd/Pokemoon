import { listPokemon, getPokemonByName } from "./Pokedex.telefunc";

export type PokemonCardBase = {
  id: number;
  name: string;
  types: string[];
};

export type Data = {
  gen3Pokemon: PokemonCardBase[];
};

export async function data(): Promise<Data> {
  const all = await listPokemon(500, 0);
  const gen3 = all.filter((p) => p.id >= 252 && p.id <= 386);

  const gen3Pokemon = await Promise.all(
    gen3.map(async (p) => {
      const details = await getPokemonByName(p.name);

      return {
        id: details.id,
        name: details.name,
        types: details.types.map((t) => t.type.name),
      };
    })
  );

  return { gen3Pokemon };
}

import { listPokemon, type PokemonListItem } from "./Pokedex.telefunc";

export type Data = {
  gen3Pokemon: PokemonListItem[];
};

export async function data(): Promise<Data> {
  const pokemon = await listPokemon(500, 0);

  const gen3Pokemon = pokemon.filter(
    (p) => p.id >= 252 && p.id <= 386
  );

  return {
    gen3Pokemon
  };
}

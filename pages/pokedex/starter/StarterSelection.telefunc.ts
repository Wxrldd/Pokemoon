import { listPokemon, type PokemonListItem } from "./../Pokedex.telefunc";

async function getPokemonData (names: string[]) {
  const allPokemon = await listPokemon(400, 0);
  const starterPokemon: PokemonListItem[] = [];
  for (const name of names) {
    const pokemon = allPokemon.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (pokemon) {
      starterPokemon.push(pokemon);
    }
  }
  return starterPokemon;
}

export async function getStarterPokemon () {
  const starterNames = ["Treecko", "Torchic", "Mudkip"];
  return getPokemonData(starterNames);
}
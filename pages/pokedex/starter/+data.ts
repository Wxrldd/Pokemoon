import { getStarterPokemon } from "./StarterSelection.telefunc";
import { getPokemonByName } from "../Pokedex.telefunc";

export type StarterDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

export type Data = {
  starters: StarterDetails[];
};

export async function data(): Promise<Data> {
  const basicStarters = await getStarterPokemon();

  const starters = await Promise.all(
    basicStarters.map(async (p) => {
      const details = await getPokemonByName(p.name);

      const stat = (name: string) =>
        details.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

      return {
        id: details.id,
        name: details.name,
        height: details.height,
        weight: details.weight,
        types: details.types.map((t) => t.type.name),
        stats: {
          hp: stat("hp"),
          attack: stat("attack"),
          defense: stat("defense"),
          speed: stat("speed"),
        },
      };
    })
  );

  return { starters };
}

import type { PageContextServer } from "vike/types";
import { getCurrentUser } from "../server/auth";
import { listPokemon, getPokemonByName } from "./pokedex/Pokedex.telefunc";
import { getStarterPokemon } from "./pokedex/starter/StarterSelection.telefunc";

export type User = {
  userId: number;
  email: string;
};

export type PokemonCardBase = {
  id: number;
  name: string;
  types: string[];
};

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
  user: User | null;
  gen3Pokemon: PokemonCardBase[];
  starters: StarterDetails[];
};


export async function data(pageContext: PageContextServer): Promise<Data> {
  const headers = pageContext.headers || {};
  const cookieHeader = headers.cookie || headers.Cookie || "";

  const request = new Request("http://localhost", {
    headers: { cookie: cookieHeader },
  });

  const user = await getCurrentUser(request);
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

  return {
    user,
    gen3Pokemon,
    starters,
  };
}

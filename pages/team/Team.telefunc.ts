import { getContext } from "telefunc";
import { getPrisma } from "../../utils/getPrisma";
import { getPokemonByName } from "../pokedex/Pokedex.telefunc";

export type TeamPokemonEnriched = {
  id: number;
  speciesName: string;
  nickname: string | null;
  level: number;
  currentHP: number;
  maxHP: number;
  position: number;
  pokeApiId: number;
  types: string[];
};

export type GetTeamResult =
  | { success: true; team: TeamPokemonEnriched[] }
  | { success: false; error: string };

export async function getTeamPokemons(): Promise<GetTeamResult> {
  const context = getContext<{ user: { userId: number; email: string } | null }>();
  const user = context?.user;

  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  const prisma = getPrisma();

  const teamPokemons = await prisma.teamPokemon.findMany({
    where: { userId: user.userId },
    orderBy: { position: "asc" },
  });

  const enriched: TeamPokemonEnriched[] = [];

  for (const tp of teamPokemons) {
    try {
      const details = await getPokemonByName(tp.speciesName);
      enriched.push({
        id: tp.id,
        speciesName: tp.speciesName,
        nickname: tp.nickname,
        level: tp.level,
        currentHP: tp.currentHP,
        maxHP: tp.maxHP,
        position: tp.position,
        pokeApiId: details.id,
        types: details.types.map((t) => t.type.name),
      });
    } catch (err) {
      console.error(`Failed to fetch PokeAPI data for ${tp.speciesName}:`, err);
      enriched.push({
        id: tp.id,
        speciesName: tp.speciesName,
        nickname: tp.nickname,
        level: tp.level,
        currentHP: tp.currentHP,
        maxHP: tp.maxHP,
        position: tp.position,
        pokeApiId: 0,
        types: ["normal"],
      });
    }
  }

  return { success: true, team: enriched };
}

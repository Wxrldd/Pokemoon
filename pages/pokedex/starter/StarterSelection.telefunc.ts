import { listPokemon, type PokemonListItem } from "./../Pokedex.telefunc";
import { PrismaClient } from '@prisma/client';

type PokemonStat = {
  base_stat: number;
  stat: {
    name: string;
  };
};

type PokemonDetail = {
  name: string;
  stats: PokemonStat[];
}

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

export async function selectStarter(pokemonId: number, userId: number) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    const existingTeam = await prisma.teamPokemon.findFirst({
      where: { userId }
    });

    if (existingTeam) {
      throw new Error("Tu as déjà choisi ton starter !");
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const pokemon: PokemonDetail = await response.json();

    const stat = (name: string) =>
      pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

    const hp = stat("hp");

    await prisma.teamPokemon.create({
      data: {
        userId,
        speciesName: pokemon.name,
        level: 5,
        currentHP: hp,
        maxHP: hp,
        position: 1,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error selecting starter:", error);
    throw error;
  }
}
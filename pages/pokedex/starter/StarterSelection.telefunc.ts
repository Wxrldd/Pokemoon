import { listPokemon, type PokemonListItem } from "../Pokedex.telefunc";
import { getPrisma } from '../../../utils/getPrisma';

type PokemonStat = {
  base_stat: number;
  stat: {
    name: string;
  };
};

type PokemonDetail = {
  name: string;
  stats: PokemonStat[];
};

type SelectStarterResult = {
  success: true;
} | {
  success: false;
  error: string;
};

type SetTrainerNameResult = {
  success: true;
} | {
  success: false;
  error: string;
};


async function getPokemonData(names: string[]): Promise<PokemonListItem[]> {
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

export async function getStarterPokemon(): Promise<PokemonListItem[]> {
  const starterNames = ["Treecko", "Torchic", "Mudkip"];
  return getPokemonData(starterNames);
}

export async function selectStarter(
  pokemonId: number,
  userId: number
): Promise<SelectStarterResult> {
  const prisma = getPrisma();

  try {
    const existingTeam = await prisma.teamPokemon.findFirst({
      where: { userId }
    });

    if (existingTeam) {
      return {
        success: false,
        error: "Tu as déjà choisi ton starter !"
      };
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Pokémon introuvable"
      };
    }

    const pokemon: PokemonDetail = await response.json();

    const getStat = (name: string): number =>
      pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

    const hp = getStat("hp");

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
    console.error("Erreur lors de la sélection du starter:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la sélection"
    };
  }
}

export async function setTrainerName(
  userId: number,
  trainerName: string
): Promise<SetTrainerNameResult> {
  const prisma = getPrisma();

  try {
    if (!trainerName || trainerName.trim().length < 3) {
      return {
        success: false,
        error: "Le nom doit contenir au moins 3 caractères"
      };
    }
    
    const existingTrainer = await prisma.user.findFirst({
      where: {
        trainerName: trainerName.trim()
      }
    });

    if (existingTrainer) {
      return {
        success: false,
        error: "Ce nom de dresseur est déjà pris"
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        trainerName: trainerName.trim()
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la définition du nom:", error);
    return {
      success: false,
      error: "Une erreur est survenue"
    };
  }
}
export type StarterSelectionResult = {
  success: true;
  pokemonName: string;
} | {
  success: false;
  error: string;
};

export type TrainerNameResult = {
  success: true;
} | {
  success: false;
  error: string;
};

export type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export type StarterPokemon = {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  stats: PokemonStats;
};
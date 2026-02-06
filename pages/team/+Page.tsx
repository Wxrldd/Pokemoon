import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { useState, useEffect } from "react";
import type { Data } from "../+data";
import { getTeamPokemons, type TeamPokemonEnriched } from "./Team.telefunc";

const TYPE_STYLE: Record<
  string,
  { border: string; badge: string; button: string }
> = {
  grass: { border: "border-green-300", badge: "bg-green-200 text-green-900", button: "bg-green-600 hover:bg-green-700" },
  fire: { border: "border-orange-300", badge: "bg-orange-200 text-orange-900", button: "bg-orange-600 hover:bg-orange-700" },
  water: { border: "border-blue-300", badge: "bg-blue-200 text-blue-900", button: "bg-blue-600 hover:bg-blue-700" },
  electric: { border: "border-yellow-300", badge: "bg-yellow-200 text-yellow-900", button: "bg-yellow-600 hover:bg-yellow-700" },
  psychic: { border: "border-pink-300", badge: "bg-pink-200 text-pink-900", button: "bg-pink-600 hover:bg-pink-700" },
  fighting: { border: "border-red-300", badge: "bg-red-200 text-red-900", button: "bg-red-600 hover:bg-red-700" },
  ground: { border: "border-yellow-300", badge: "bg-yellow-200 text-yellow-900", button: "bg-yellow-600 hover:bg-yellow-700" },
  rock: { border: "border-amber-300", badge: "bg-amber-200 text-amber-900", button: "bg-amber-600 hover:bg-amber-700" },
  bug: { border: "border-lime-300", badge: "bg-lime-200 text-lime-900", button: "bg-lime-600 hover:bg-lime-700" },
  ghost: { border: "border-violet-300", badge: "bg-violet-200 text-violet-900", button: "bg-violet-600 hover:bg-violet-700" },
  dragon: { border: "border-indigo-300", badge: "bg-indigo-200 text-indigo-900", button: "bg-indigo-600 hover:bg-indigo-700" },
  ice: { border: "border-cyan-300", badge: "bg-cyan-200 text-cyan-900", button: "bg-cyan-600 hover:bg-cyan-700" },
  dark: { border: "border-slate-400", badge: "bg-slate-600 text-slate-100", button: "bg-slate-700 hover:bg-slate-800" },
  steel: { border: "border-gray-300", badge: "bg-gray-200 text-gray-900", button: "bg-gray-600 hover:bg-gray-700" },
  fairy: { border: "border-rose-300", badge: "bg-rose-200 text-rose-900", button: "bg-rose-600 hover:bg-rose-700" },
  poison: { border: "border-purple-300", badge: "bg-purple-200 text-purple-900", button: "bg-purple-600 hover:bg-purple-700" },
  flying: { border: "border-sky-300", badge: "bg-sky-200 text-sky-900", button: "bg-sky-600 hover:bg-sky-700" },
  normal: { border: "border-gray-300", badge: "bg-gray-100 text-gray-800", button: "bg-gray-600 hover:bg-gray-700" },
};

const FALLBACK = TYPE_STYLE.normal;

function PokemonCard({ pokemon }: { pokemon: TeamPokemonEnriched }) {
  const mainType = pokemon.types[0] ?? "normal";
  const style = TYPE_STYLE[mainType] ?? FALLBACK;

  return (
    <div className={`bg-white border-2 ${style.border} rounded-2xl p-6 hover:shadow-lg transition`}>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokeApiId}.png`}
        alt={pokemon.speciesName}
        className="h-32 w-32 mx-auto"
      />

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">#{pokemon.pokeApiId}</p>
        <h3 className="text-xl font-bold capitalize">
          {pokemon.nickname ?? pokemon.speciesName}
        </h3>
        {pokemon.nickname && (
          <p className="text-sm text-gray-500 capitalize">{pokemon.speciesName}</p>
        )}
        <div className="mt-2 flex justify-center gap-2">
          {pokemon.types.map((t) => (
            <span
              key={t}
              className={`px-3 py-1 text-xs rounded-full capitalize ${style.badge}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Niveau</span>
          <span className="font-bold">{pokemon.level}</span>
        </div>
        <div className="flex justify-between">
          <span>PV</span>
          <span className="font-bold">
            {pokemon.currentHP} / {pokemon.maxHP}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ position }: { position: number }) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px]">
      <p className="text-gray-400 text-lg">Emplacement {position}</p>
      <p className="text-gray-400 text-sm mt-2">Vide</p>
    </div>
  );
}

export default function TeamPage() {
  const pageContext = usePageContext();
  const { user } = pageContext.data as Data;

  const [team, setTeam] = useState<TeamPokemonEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getTeamPokemons();
      if (cancelled) return;

      if (!result.success) {
        setError(result.error);
        setTeam([]);
      } else {
        setTeam(result.team);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl text-gray-600">Chargement de ton équipe...</p>
        </div>
      </div>
    );
  }

  const slots = [1, 2, 3] as const;
  const teamByPosition = Object.fromEntries(
    team.map((p) => [p.position, p])
  ) as Record<number, TeamPokemonEnriched>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Gérer mon équipe</h1>
        <p className="text-center text-gray-600 mb-8">
          Ton équipe peut contenir jusqu&apos;à 3 Pokémon.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-red-800 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slots.map((pos) => {
            const pokemon = teamByPosition[pos];
            return pokemon ? (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ) : (
              <EmptySlot key={pos} position={pos} />
            );
          })}
        </div>

        {team.length === 0 && !error && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Tu n&apos;as pas encore de Pokémon dans ton équipe.
            </p>
            <a
              href="/pokedex/starter"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Choisir un starter
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

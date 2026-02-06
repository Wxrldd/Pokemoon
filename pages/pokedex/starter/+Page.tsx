import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { useState, useEffect } from "react";
import type { Data } from "../../+data";
import { useStarterSelection } from "../../../hook/useStarterSelection";

const TYPE_COLORS = {
  grass: "green",
  fire: "orange",
  water: "blue",
} as const;

type Step = "SELECT_STARTER" | "SET_NAME";

export default function StarterSelectionPage() {
  const pageContext = usePageContext();
  const { starters, user } = pageContext.data as Data;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const userId = user.userId;

  const [step, setStep] = useState<Step>("SELECT_STARTER");
  const [selectedPokemon, setSelectedPokemon] = useState<{ id: number; name: string; type: string } | null>(null);
  const [trainerName, setTrainerName] = useState("");

  const { handleSelectStarter, handleSetTrainerName, isSelecting, error } = useStarterSelection(userId);

  const handlePokemonSelect = async (pokemonId: number, pokemonName: string, type: string) => {
    const result = await handleSelectStarter(pokemonId, pokemonName);
    if (result.success) {
      setSelectedPokemon({ id: pokemonId, name: pokemonName, type });
      setStep("SET_NAME");
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSetTrainerName(trainerName);
    if (result.success) {
      alert(`Bienvenue ${trainerName}, tu commences avec ${selectedPokemon?.name} et 3000 PokéDollars !`);
      navigate("/pokedex");
    }
  };

  if (step === "SET_NAME" && selectedPokemon) {
    const color = TYPE_COLORS[selectedPokemon.type as keyof typeof TYPE_COLORS];

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Félicitations ! 🎉</h1>

          <div className="text-center mb-6">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
              alt={selectedPokemon.name}
              className="h-32 w-32 mx-auto"
            />
            <p className="mt-4 text-lg">Tu as choisi <strong className="capitalize">{selectedPokemon.name}</strong> !</p>
          </div>

          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
            <p className="font-semibold">💰 Tu reçois 3000 PokéDollars !</p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Choisis ton nom de dresseur</label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Sacha, Ondine, Pierre..."
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                minLength={3}
                maxLength={20}
                required
                disabled={isSelecting}
              />
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSelecting || trainerName.length < 3}
              className={`w-full py-3 rounded-lg font-bold text-white bg-${color}-600 hover:bg-${color}-700 disabled:opacity-50`}
            >
              {isSelecting ? "Enregistrement..." : "Commencer l'aventure !"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Choisis ton Starter !</h1>
        <p className="text-center text-gray-600 mb-8">Avec qui veux-tu commencer ton aventure ?</p>

        {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-red-800 text-center">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {starters.map((p) => {
            const color = TYPE_COLORS[p.types[0] as keyof typeof TYPE_COLORS];

            return (
              <div key={p.id} className={`bg-white border-2 border-${color}-300 rounded-2xl p-6 hover:shadow-lg transition`}>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                  alt={p.name}
                  className="h-32 w-32 mx-auto"
                />

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">#{p.id}</p>
                  <h3 className="text-xl font-bold capitalize">{p.name}</h3>
                  <div className="mt-2 flex justify-center gap-2">
                    {p.types.map((t) => (
                      <span key={t} className={`px-3 py-1 text-xs rounded-full bg-${color}-200 text-${color}-900 capitalize`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PV</span>
                    <span className="font-bold">{p.stats.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attaque</span>
                    <span className="font-bold">{p.stats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Défense</span>
                    <span className="font-bold">{p.stats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitesse</span>
                    <span className="font-bold">{p.stats.speed}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePokemonSelect(p.id, p.name, p.types[0])}
                  disabled={isSelecting}
                  className={`mt-4 w-full py-2 rounded-lg font-bold text-white bg-${color}-600 hover:bg-${color}-700 disabled:opacity-50`}
                >
                  {isSelecting ? "⏳" : `Choisir ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
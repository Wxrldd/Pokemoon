import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";

export default function PokemonPage() {
  const pageContext = usePageContext();
  const data = pageContext.data as Data;

  const { gen3Pokemon } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pokédex</h1>
          <p className="text-lg text-gray-600">
            Découvrez tous les Pokémon de la génération 3
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {gen3Pokemon.map((p) => {
            const imageUrl =
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <div className="w-full h-32 flex items-center justify-center mb-3">
                  <img
                    src={imageUrl}
                    alt={p.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-400 mb-1">
                  #{p.id.toString().padStart(3, '0')}
                </span>
                <h3 className="capitalize font-bold text-gray-900 text-lg">
                  {p.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
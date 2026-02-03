export default function Page() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Attrapez-les tous avec Pokemoon
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Découvrez l'univers complet des Pokémon, explorez leurs statistiques, 
              types et évolutions. Votre encyclopédie Pokémon interactive.
            </p>
            <div className="flex gap-4">
              <a 
                href="/pokedex" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Explorer le Pokédex
              </a>
              <a 
                href="/register" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Créer un compte
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
              alt="Pikachu" 
              className="w-96 h-96 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
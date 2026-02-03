import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";

export default function StarterSelectionPage() {
  const pageContext = usePageContext();
  const { starters } = pageContext.data as Data;

  return (
    <div>
      <h1 className="text-2xl font-bold">Choisis ton starter</h1>

      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {starters.map((p) => {
          const imageUrl =
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

          return (
            <li
              key={p.id}
              className="rounded-xl border p-5 flex flex-col gap-3 hover:shadow-sm transition"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={imageUrl}
                  alt={p.name}
                  className="h-32 w-32 object-contain"
                />
                <div className="text-sm text-gray-500">#{p.id}</div>
                <div className="capitalize text-lg font-semibold">
                  {p.name}
                </div>

                <div className="mt-1 flex gap-2">
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600 text-center">
                Taille : {(p.height / 10).toFixed(1)} m • Poids :{" "}
                {(p.weight / 10).toFixed(1)} kg
              </div>

              <div className="text-sm">
                <Stat label="HP" value={p.stats.hp} />
                <Stat label="Attaque" value={p.stats.attack} />
                <Stat label="Défense" value={p.stats.defense} />
                <Stat label="Vitesse" value={p.stats.speed} />
              </div>

              <button
                className="mt-2 rounded-lg bg-black px-4 py-2 text-white text-sm"
                onClick={() => alert(`Tu as choisi ${p.name} !`)}
              >
                Choisir ce starter
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-gray-500">{label}</span>
      <div className="flex-1 h-2 rounded bg-gray-200">
        <div
          className="h-2 rounded bg-black"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-8 text-xs text-right">{value}</span>
    </div>
  );
}

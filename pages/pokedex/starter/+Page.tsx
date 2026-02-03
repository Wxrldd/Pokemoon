import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";

const TYPE_STYLES: Record<
  string,
  {
    card: string;
    badge: string;
    bar: string;
    button: string;
  }
> = {
  grass: {
    card: "bg-green-50 border-green-200",
    badge: "bg-green-200 text-green-900",
    bar: "bg-green-500",
    button: "bg-green-600 hover:bg-green-700",
  },
  fire: {
    card: "bg-orange-50 border-orange-200",
    badge: "bg-orange-200 text-orange-900",
    bar: "bg-orange-500",
    button: "bg-orange-600 hover:bg-orange-700",
  },
  water: {
    card: "bg-blue-50 border-blue-200",
    badge: "bg-blue-200 text-blue-900",
    bar: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

export default function StarterSelectionPage() {
  const pageContext = usePageContext();
  const { starters } = pageContext.data as Data;

  return (
    <div>
      <h1 className="text-2xl font-bold">Choisis ton starter</h1>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 list-none">
        {starters.map((p) => {
          const mainType = p.types[0];
          const style = TYPE_STYLES[mainType];

          const imageUrl =
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

          return (
            <li
              key={p.id}
              className={`
                relative rounded-2xl border p-6
                transition transform hover:-translate-y-1 hover:shadow-lg
                ${style.card}
              `}
            >
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt={p.name}
                  className="h-36 w-36 object-contain drop-shadow"
                />
              </div>

              <div className="mt-3 text-center">
                <div className="text-xs opacity-70">#{p.id}</div>
                <div className="capitalize text-xl font-bold">{p.name}</div>

                <div className="mt-2 flex justify-center gap-2">
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className={`rounded-full px-3 py-1 text-xs capitalize ${style.badge}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-xs text-center opacity-70">
                {(p.height / 10).toFixed(1)} m • {(p.weight / 10).toFixed(1)} kg
              </div>

              <div className="mt-4 space-y-2">
                <Stat label="HP" value={p.stats.hp} color={style.bar} />
                <Stat label="Attaque" value={p.stats.attack} color={style.bar} />
                <Stat label="Défense" value={p.stats.defense} color={style.bar} />
                <Stat label="Vitesse" value={p.stats.speed} color={style.bar} />
              </div>

              <button
                className={`mt-5 w-full rounded-xl px-4 py-2 text-white font-semibold transition ${style.button}`}
                onClick={() => alert(`Tu as choisi ${p.name} !`)}
              >
                Choisir {p.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs">{label}</span>
      <div className="flex-1 h-2 rounded bg-black/10">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-8 text-xs text-right">{value}</span>
    </div>
  );
}

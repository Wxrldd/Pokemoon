import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";

export default function PokemonPage() {
  const pageContext = usePageContext();
  const data = pageContext.data as Data;

  const { gen3Pokemon } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold">Pokédex</h1>

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {gen3Pokemon.map((p) => {
          const imageUrl =
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

          return (
            <li
              key={p.id}
              className="rounded-xl border p-4 flex flex-col items-center text-center"
            >
              <img
                src={imageUrl}
                alt={p.name}
                className="h-24 w-24 object-contain"
                loading="lazy"
              />
              <div className="mt-2 text-sm text-gray-500">#{p.id}</div>
              <div className="capitalize font-medium">{p.name}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

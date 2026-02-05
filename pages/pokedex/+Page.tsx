import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./../+data";
import { usePageContext } from "vike-react/usePageContext";

type HoverStats = {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

const TYPE_STYLE: Record<
  string,
  { card: string; badge: string; bar: string; accent: string }
> = {
  grass: {
    card: "border-green-200 bg-green-50/70",
    badge: "bg-green-200 text-green-900",
    bar: "bg-green-600",
    accent: "text-green-700",
  },
  fire: {
    card: "border-orange-200 bg-orange-50/70",
    badge: "bg-orange-200 text-orange-900",
    bar: "bg-orange-600",
    accent: "text-orange-700",
  },
  water: {
    card: "border-blue-200 bg-blue-50/70",
    badge: "bg-blue-200 text-blue-900",
    bar: "bg-blue-600",
    accent: "text-blue-700",
  },
  electric: {
    card: "border-yellow-200 bg-yellow-50/70",
    badge: "bg-yellow-200 text-yellow-900",
    bar: "bg-yellow-500",
    accent: "text-yellow-700",
  },
  psychic: {
    card: "border-pink-200 bg-pink-50/70",
    badge: "bg-pink-200 text-pink-900",
    bar: "bg-pink-600",
    accent: "text-pink-700",
  },
  fighting: {
    card: "border-red-200 bg-red-50/70",
    badge: "bg-red-200 text-red-900",
    bar: "bg-red-600",
    accent: "text-red-700",
  },
  ground: {
    card: "border-yellow-300 bg-yellow-50/70",
    badge: "bg-yellow-200 text-yellow-900",
    bar: "bg-yellow-600",
    accent: "text-yellow-800",
  },
  rock: {
    card: "border-amber-200 bg-amber-50/70",
    badge: "bg-amber-200 text-amber-900",
    bar: "bg-amber-600",
    accent: "text-amber-800",
  },
  bug: {
    card: "border-lime-200 bg-lime-50/70",
    badge: "bg-lime-200 text-lime-900",
    bar: "bg-lime-600",
    accent: "text-lime-800",
  },
  ghost: {
    card: "border-violet-200 bg-violet-50/70",
    badge: "bg-violet-200 text-violet-900",
    bar: "bg-violet-600",
    accent: "text-violet-800",
  },
  dragon: {
    card: "border-indigo-200 bg-indigo-50/70",
    badge: "bg-indigo-200 text-indigo-900",
    bar: "bg-indigo-600",
    accent: "text-indigo-800",
  },
  ice: {
    card: "border-cyan-200 bg-cyan-50/70",
    badge: "bg-cyan-200 text-cyan-900",
    bar: "bg-cyan-600",
    accent: "text-cyan-800",
  },
  dark: {
    card: "border-slate-600 bg-slate-400/70",
    badge: "bg-slate-600 text-slate-900",
    bar: "bg-slate-700",
    accent: "text-slate-800",
  },
  steel: {
    card: "border-gray-300 bg-gray-50/70",
    badge: "bg-gray-200 text-gray-900",
    bar: "bg-gray-600",
    accent: "text-gray-800",
  },
  fairy: {
    card: "border-rose-200 bg-rose-50/70",
    badge: "bg-rose-200 text-rose-900",
    bar: "bg-rose-600",
    accent: "text-rose-800",
  },
  poison: {
    card: "border-purple-200 bg-purple-50/70",
    badge: "bg-purple-200 text-purple-900",
    bar: "bg-purple-600",
    accent: "text-purple-800",
  },
  flying: {
    card: "border-sky-200 bg-sky-50/70",
    badge: "bg-sky-200 text-sky-900",
    bar: "bg-sky-600",
    accent: "text-sky-800",
  },
  normal: {
    card: "border-gray-200 bg-white",
    badge: "bg-gray-100 text-gray-800",
    bar: "bg-gray-700",
    accent: "text-gray-800",
  },
};

const FALLBACK = TYPE_STYLE.normal;

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer?.disconnect();
          observer = null;
        }
      },
      options
    );

    observer.observe(el);

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, [options?.root, options?.rootMargin, options?.threshold]);

  return { ref, inView };
}

export default function PokemonPage() {
  const data = useData<Data>();
  const { gen3Pokemon } = data;
  const { user } = usePageContext().data as Data;
  console.log(user);

  console.log(user)
  
  const [detailsMap, setDetailsMap] = useState<Record<string, HoverStats | undefined>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const hoverTimer = useRef<number | null>(null);

  const list = useMemo(() => gen3Pokemon, [gen3Pokemon]);

  async function ensureStats(name: string) {
    const key = name.toLowerCase();
    if (detailsMap[key] || loadingMap[key]) return;

    setLoadingMap((m) => ({ ...m, [key]: true }));
    try {
      const res = await fetch(`/api/pokemon-hover?nameOrId=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = (await res.json()) as HoverStats;
      setDetailsMap((m) => ({ ...m, [key]: d }));
    } finally {
      setLoadingMap((m) => ({ ...m, [key]: false }));
    }
  }

  function scheduleHoverFetch(name: string) {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      ensureStats(name);
    }, 120);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pokédex de Pokémooon
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {list.map((p) => (
            <LazyPokemonCard
              key={p.id}
              pokemon={p}
              details={detailsMap[p.name.toLowerCase()]}
              isLoading={!!loadingMap[p.name.toLowerCase()]}
              onHover={() => scheduleHoverFetch(p.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LazyPokemonCard(props: {
  pokemon: { id: number; name: string; types: string[] };
  details?: HoverStats;
  isLoading: boolean;
  onHover: () => void;
}) {
  const { pokemon: p, details, onHover } = props;

  const { ref, inView } = useInView({
    root: null,
    rootMargin: "100px 0px",
    threshold: 0.01,
  });

  const mainType = p.types?.[0] ?? "normal";
  const style = TYPE_STYLE[mainType] ?? FALLBACK;

  if (!inView) {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border p-5 ${style.card}`}
      >
        <div className="animate-pulse">
          <div className="w-full h-28 rounded-xl bg-black/10" />
          <div className="mt-4 h-3 w-16 mx-auto rounded bg-black/10" />
          <div className="mt-2 h-4 w-24 mx-auto rounded bg-black/10" />
          <div className="mt-3 flex justify-center gap-2">
            <div className="h-6 w-14 rounded-full bg-black/10" />
            <div className="h-6 w-14 rounded-full bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  const imageUrl =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

  return (
    <div
      ref={ref}
      onMouseEnter={onHover}
      className={`group relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.05] ${style.card}`}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-black/5 blur-2xl opacity-0 group-hover:opacity-100 transition" />

      <div className="w-full h-28 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={p.name}
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs font-semibold text-gray-500">
          #{String(p.id).padStart(3, "0")}
        </span>
        <h3 className="capitalize font-extrabold text-gray-900 text-lg">
          {p.name}
        </h3>

        <div className="mt-2 flex flex-wrap justify-center gap-2 min-h-[28px]">
          {p.types.map((t) => {
            const badge = (TYPE_STYLE[t] ?? FALLBACK).badge;
            return (
              <span
                key={t}
                className={`rounded-full px-3 py-1 text-xs capitalize ${badge}`}
              >
                {t}
              </span>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 p-5 bg-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
        <div className="pointer-events-none rounded-2xl border bg-white/90 p-4 shadow-sm">
          <div className={`text-sm font-bold ${style.accent}`}>
            Stats
          </div>

          {details && (
            <div className="mt-3 space-y-2 text-sm">
              <Stat label="HP" value={details.stats.hp} barClass={style.bar} />
              <Stat label="Att." value={details.stats.attack} barClass={style.bar} />
              <Stat label="Def." value={details.stats.defense} barClass={style.bar} />
              <Stat label="Vit." value={details.stats.speed} barClass={style.bar} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  barClass,
}: {
  label: string;
  value: number;
  barClass: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs text-gray-600">{label}</span>
      <div className="flex-1 h-2 rounded bg-black/10">
        <div className={`h-2 rounded ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-right text-gray-700">{value}</span>
    </div>
  );
}

import { useState, useEffect } from "react";
import { getLeaderboard, type LeaderboardEntry } from "./Leaderboard.telefunc";

type Tab = "money" | "collectors";

function RankRow({ entry, isMoney }: { entry: LeaderboardEntry; isMoney: boolean }) {
  const medalClass =
    entry.rank === 1
      ? "bg-amber-400 text-amber-900"
      : entry.rank === 2
        ? "bg-gray-300 text-gray-700"
        : entry.rank === 3
          ? "bg-amber-700 text-amber-100"
          : "bg-gray-100 text-gray-700";

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
      <span
        className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${medalClass}`}
      >
        {entry.rank}
      </span>
      <span className="flex-1 font-semibold text-gray-900 truncate">
        {entry.displayName}
      </span>
      <span className="font-bold text-lg text-amber-600">
        {isMoney ? `${entry.value.toLocaleString()} ₽` : `${entry.value} espèce${entry.value > 1 ? "s" : ""}`}
      </span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("money");
  const [data, setData] = useState<{ money: LeaderboardEntry[]; collectors: LeaderboardEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getLeaderboard();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur de chargement");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl text-gray-600">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-center">
          {error}
        </div>
      </div>
    );
  }

  const entries = activeTab === "money" ? data!.money : data!.collectors;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Classement général</h1>
        <p className="text-center text-gray-600 mb-8">
          Découvre les meilleurs dresseurs de Pokemoon.
        </p>

        <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("money")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === "money"
                ? "bg-amber-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            💰 Argent (PokéDollars)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("collectors")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === "collectors"
                ? "bg-amber-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🎯 Collectionneurs (espèces uniques)
          </button>
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              Aucun dresseur pour le moment.
            </div>
          ) : (
            entries.map((entry) => (
              <RankRow
                key={`${activeTab}-${entry.userId}`}
                entry={entry}
                isMoney={activeTab === "money"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

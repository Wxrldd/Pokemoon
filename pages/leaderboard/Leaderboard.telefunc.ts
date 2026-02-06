import { getPrisma } from "../../utils/getPrisma";

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  displayName: string;
  value: number;
};

export type LeaderboardResult = {
  money: LeaderboardEntry[];
  collectors: LeaderboardEntry[];
};

export async function getLeaderboard(): Promise<LeaderboardResult> {
  const prisma = getPrisma();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      trainerName: true,
      email: true,
      pokedollars: true,
    },
    orderBy: { pokedollars: "desc" },
  });

  const moneyRanking: LeaderboardEntry[] = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    displayName: u.trainerName ?? u.email,
    value: u.pokedollars,
  }));

  const teamPokemons = await prisma.teamPokemon.findMany({
    select: { userId: true, speciesName: true },
  });

  const speciesCountByUser = new Map<number, Set<string>>();
  for (const tp of teamPokemons) {
    if (!speciesCountByUser.has(tp.userId)) {
      speciesCountByUser.set(tp.userId, new Set());
    }
    speciesCountByUser.get(tp.userId)!.add(tp.speciesName);
  }

  const allUsersForCollectors = await prisma.user.findMany({
    select: { id: true, trainerName: true, email: true },
  });

  const collectorsRaw = allUsersForCollectors
    .map((u) => ({
      userId: u.id,
      count: speciesCountByUser.get(u.id)?.size ?? 0,
      displayName: u.trainerName ?? u.email,
    }))
    .sort((a, b) => b.count - a.count);

  const collectorsRanking: LeaderboardEntry[] = collectorsRaw.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    displayName: r.displayName,
    value: r.count,
  }));

  return {
    money: moneyRanking,
    collectors: collectorsRanking,
  };
}

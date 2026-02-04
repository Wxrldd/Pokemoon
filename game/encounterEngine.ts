import { getAreaEncountersFromPokeAPI, type EncounterSlot } from "./encounters";

export type WildRoll = { name: string; level: number };

const group: EncounterSlot[] = [
  { name: "1", weight: 70, minLevel: 1, maxLevel: 1 },
  { name: "2", weight: 22, minLevel: 2, maxLevel: 2 },
  { name: "3", weight: 8, minLevel: 3, maxLevel: 3 },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandomChoice(team: EncounterSlot[]): EncounterSlot {
  const totalWeight = team.reduce((sum, pokemon) => sum + pokemon.weight, 0);
  let random = Math.random() * totalWeight;
  let proba = 0;

  for (const pokemon of team) {
    proba += pokemon.weight;
    if (random <= proba) return pokemon;
  }
  return team[team.length - 1];
}

function rollEncounterCount(): number {
  const r = Math.random();
  if (r < 0.7) return 1;
  if (r < 0.95) return 2;
  return 3;
}

export async function stepEncounter(opts: {
  areaName: string;
  version: string;
  method: string;
  ignoreConditional?: boolean;
}): Promise<WildRoll[]> {
  const area = await getAreaEncountersFromPokeAPI(opts);

  if (Math.random() > area.encounterRate) return [];
  if (!area.slots.length) return [];

  const groupLevel = weightedRandomChoice(group).maxLevel;
  const count = rollEncounterCount();

  const resultat: WildRoll[] = [];
  for (let i = 0; i < count; i++) {
    const slot = weightedRandomChoice(area.slots);
    const low = Math.max(slot.minLevel, groupLevel - 2);
    const high = Math.min(slot.maxLevel, groupLevel + 2);
    if (low > high) continue;
    const level = randInt(low, high);
    resultat.push({ name: slot.name, level });
  }

  return resultat;
}

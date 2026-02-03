import { ENCOUNTERS, type EncounterSlot } from "./encounters";

export type WildRoll = { name: string; level: number };

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedPick(slots: EncounterSlot[]): EncounterSlot {
  const total = slots.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const slot of slots) {
    r -= slot.weight;
    if (r <= 0) return slot;
  }
  return slots[slots.length - 1];
}

export function walkStep(areaKey: string): WildRoll[] {
  const area = ENCOUNTERS[areaKey];
  if (!area) throw new Error(`Zone inconnue: ${areaKey}`);

  if (Math.random() > area.encounterRate) return [];

  const groupSize = weightedPick([
    { name: "1", weight: 70, minLevel: 1, maxLevel: 1 },
    { name: "2", weight: 22, minLevel: 2, maxLevel: 2 },
    { name: "3", weight: 8, minLevel: 3, maxLevel: 3 },
  ] as any).maxLevel;

  const result: WildRoll[] = [];
  for (let i = 0; i < groupSize; i++) {
    const slot = weightedPick(area.slots);
    result.push({ name: slot.name, level: randInt(slot.minLevel, slot.maxLevel) });
  }
  return result;
}

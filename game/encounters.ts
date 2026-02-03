export type EncounterSlot = {
  name: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
};

export type AreaEncounters = {
  encounterRate: number;
  slots: EncounterSlot[];
};

export const ENCOUNTERS: Record<string, AreaEncounters> = {
  "route-101": {
    encounterRate: 0.18,
    slots: [
      { name: "Chenipotte", weight: 60, minLevel: 2, maxLevel: 4 },
      { name: "Zigzaton", weight: 40, minLevel: 2, maxLevel: 4 },
    ],
  },
  "route-102": {
    encounterRate: 0.2,
    slots: [
      { name: "Chenipotte", weight: 35, minLevel: 2, maxLevel: 5 },
      { name: "Nirondelle", weight: 25, minLevel: 2, maxLevel: 5 },
      { name: "Rattata", weight: 15, minLevel: 2, maxLevel: 5 },
      { name: "Zigzaton", weight: 25, minLevel: 2, maxLevel: 5 },
    ],
  },
  "route-103": {
    encounterRate: 0.2,
    slots: [
      { name: "Chenipotte", weight: 45, minLevel: 2, maxLevel: 5 },
      { name: "Nirondelle", weight: 30, minLevel: 2, maxLevel: 5 },
      { name: "Zigzaton", weight: 25, minLevel: 2, maxLevel: 5 },
    ],
  },

  "foret-de-jade": {
    encounterRate: 0.25,
    slots: [
      { name: "Chenipotte", weight: 20, minLevel: 3, maxLevel: 6 },
      { name: "Blindalys", weight: 12, minLevel: 5, maxLevel: 7 },
      { name: "Armulys", weight: 12, minLevel: 5, maxLevel: 7 },
      { name: "Mystherbe", weight: 20, minLevel: 3, maxLevel: 6 },
      { name: "Pikachu", weight: 6, minLevel: 4, maxLevel: 6 },
      { name: "Parecool", weight: 30, minLevel: 3, maxLevel: 6 },
    ],
  },

  "route-111": {
    encounterRate: 0.18,
    slots: [
      { name: "Sabelette", weight: 40, minLevel: 10, maxLevel: 14 },
      { name: "Medhyèna", weight: 35, minLevel: 10, maxLevel: 14 },
      { name: "Nirondelle", weight: 25, minLevel: 10, maxLevel: 14 },
    ],
  },
  desert: {
    encounterRate: 0.22,
    slots: [
      { name: "Cacnea", weight: 28, minLevel: 14, maxLevel: 18 },
      { name: "Balbuto", weight: 22, minLevel: 14, maxLevel: 18 },
      { name: "Kraknoix", weight: 20, minLevel: 14, maxLevel: 18 },
      { name: "Anorith", weight: 15, minLevel: 20, maxLevel: 25 },
      { name: "Lilia", weight: 15, minLevel: 20, maxLevel: 25 },
    ],
  },

  "routes-marines": {
    encounterRate: 0.12,
    slots: [
      { name: "Tentacool", weight: 55, minLevel: 15, maxLevel: 25 },
      { name: "Tentacruel", weight: 10, minLevel: 25, maxLevel: 35 },
      { name: "Wingull", weight: 25, minLevel: 15, maxLevel: 25 },
      { name: "Pelipper", weight: 10, minLevel: 25, maxLevel: 35 },
    ],
  },
  plongee: {
    encounterRate: 0.1,
    slots: [
      { name: "Relicanth", weight: 10, minLevel: 25, maxLevel: 35 },
      { name: "Coquiperl", weight: 35, minLevel: 20, maxLevel: 30 },
      { name: "Wailmer", weight: 35, minLevel: 20, maxLevel: 30 },
      { name: "Chinchou", weight: 20, minLevel: 20, maxLevel: 30 },
    ],
  },

  "route-victoire": {
    encounterRate: 0.22,
    slots: [
      { name: "Onix", weight: 20, minLevel: 35, maxLevel: 45 },
      { name: "Golbat", weight: 25, minLevel: 35, maxLevel: 45 },
      { name: "Hariyama", weight: 15, minLevel: 38, maxLevel: 48 },
      { name: "Makuhita", weight: 20, minLevel: 35, maxLevel: 42 },
      { name: "Meditikka", weight: 20, minLevel: 35, maxLevel: 45 },
    ],
  },
  "tour-celeste": {
    encounterRate: 0.18,
    slots: [
      { name: "Altaria", weight: 15, minLevel: 35, maxLevel: 45 },
      { name: "Nosferapti", weight: 80, minLevel: 25, maxLevel: 35 },
      { name: "Rayquaza", weight: 5, minLevel: 70, maxLevel: 70 },
    ],
  },
};

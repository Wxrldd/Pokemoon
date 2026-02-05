import type { MoveDetails, PokemonStats } from "./pokeapi";
import { pickEffectText } from "./pokeapi";

export type BattlePokemon = {
  name: string;
  level: number;
  sprite: string | null;
  types: string[];
  stats: PokemonStats;

  maxHp: number;
  hp: number;

  moves: Array<{
    name: string;
    details: MoveDetails;
    pp: number; 
  }>;
};

export type BattleSide = {
  team: BattlePokemon[];
  activeIndex: number;
};

export type BattleState = {
  player: BattleSide;
  enemy: BattleSide;
  log: string[];
  status: "idle" | "player_choose" | "resolving" | "finished";
  winner: "player" | "enemy" | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(p: number) {
  return Math.random() < p;
}

function stabMultiplier(attackerTypes: string[], moveType: string) {
  return attackerTypes.includes(moveType) ? 1.5 : 1.0;
}

function computeDamage(opts: {
  attacker: BattlePokemon;
  defender: BattlePokemon;
  move: MoveDetails;
}) {
  const { attacker, defender, move } = opts;

  if (!move.power || move.damage_class.name === "status") return 0;

  const level = attacker.level;
  const power = move.power;

  const atk =
    move.damage_class.name === "special"
      ? attacker.stats["special-attack"]
      : attacker.stats.attack;

  const def =
    move.damage_class.name === "special"
      ? defender.stats["special-defense"]
      : defender.stats.defense;

  const base = Math.floor((((2 * level) / 5 + 2) * power * (atk / def)) / 50) + 2;

  const stab = stabMultiplier(attacker.types, move.type.name);
  const crit = chance(1 / 16) ? 1.5 : 1.0;
  const random = randInt(85, 100) / 100;

  return Math.max(1, Math.floor(base * stab * crit * random));
}

export function getActive(side: BattleSide) {
  return side.team[side.activeIndex];
}

function autoSwitchIfFainted(side: BattleSide) {
  const active = getActive(side);
  if (active.hp > 0) return false;

  const next = side.team.findIndex((p) => p.hp > 0);
  if (next === -1) return false;
  side.activeIndex = next;
  return true;
}

function sideHasLiving(side: BattleSide) {
  return side.team.some((p) => p.hp > 0);
}

function pickEnemyMove(p: BattlePokemon) {
  const usable = p.moves.filter((m) => m.pp > 0);
  if (usable.length === 0) return null;
  return usable[Math.floor(Math.random() * usable.length)];
}

function useMove(opts: {
  attacker: BattlePokemon;
  defender: BattlePokemon;
  moveSlot: BattlePokemon["moves"][number];
  who: "player" | "enemy";
  log: string[];
}) {
  const { attacker, defender, moveSlot, who, log } = opts;
  const move = moveSlot.details;

  if (moveSlot.pp <= 0) {
    log.push(`${attacker.name} n'a plus de PP pour ${move.name} !`);
    return;
  }
  moveSlot.pp -= 1;

  log.push(`${who === "player" ? "Ton" : "L'"} ${attacker.name} utilise ${move.name} !`);

  if (move.accuracy != null) {
    const hit = chance(move.accuracy / 100);
    if (!hit) {
      log.push(`Ça rate !`);
      return;
    }
  }

  const dmg = computeDamage({ attacker, defender, move });
  if (dmg <= 0) {
    const eff = pickEffectText(move, "fr").short;
    log.push(eff);
    return;
  }

  defender.hp = clamp(defender.hp - dmg, 0, defender.maxHp);
  log.push(`${defender.name} perd ${dmg} PV.`);

  if (defender.hp === 0) log.push(`${defender.name} est K.O. !`);
}

export function resolveTurn(opts: {
  state: BattleState;
  playerMoveIndex: number;
}) {
  const s = structuredClone(opts.state) as BattleState;
  const log = [...s.log];

  const player = getActive(s.player);
  const enemy = getActive(s.enemy);

  const playerMove = player.moves[opts.playerMoveIndex];
  const enemyMove = pickEnemyMove(enemy);

  if (!playerMove) {
    log.push("Move invalide.");
    return { ...s, log };
  }
  if (!enemyMove) log.push(`${enemy.name} n'a plus de PP !`);

  const pPriority = playerMove.details.priority ?? 0;
  const ePriority = enemyMove?.details.priority ?? 0;

  const pInit = pPriority * 1000 + player.stats.speed;
  const eInit = ePriority * 1000 + enemy.stats.speed;

  const first: "player" | "enemy" =
    pInit > eInit ? "player" : pInit < eInit ? "enemy" : chance(0.5) ? "player" : "enemy";

  function act(side: "player" | "enemy") {
    const atkSide = side === "player" ? s.player : s.enemy;
    const defSide = side === "player" ? s.enemy : s.player;

    const atk = getActive(atkSide);
    const def = getActive(defSide);

    const moveSlot = side === "player" ? playerMove : enemyMove;
    if (!moveSlot) return;

    useMove({ attacker: atk, defender: def, moveSlot, who: side, log });

    if (def.hp === 0) {
      const switched = autoSwitchIfFainted(defSide);
      if (switched) {
        const newActive = getActive(defSide);
        log.push(`${side === "player" ? "L'ennemi" : "Tu"} envoie ${newActive.name} !`);
      }
    }
  }

  act(first);
  if (sideHasLiving(s.player) && sideHasLiving(s.enemy)) {
    act(first === "player" ? "enemy" : "player");
  }

  const playerAlive = sideHasLiving(s.player);
  const enemyAlive = sideHasLiving(s.enemy);

  let status: BattleState["status"] = "player_choose";
  let winner: BattleState["winner"] = null;
  if (!playerAlive || !enemyAlive) {
    status = "finished";
    winner = playerAlive ? "player" : "enemy";
    log.push(winner === "player" ? "Victoire !" : "Défaite...");
  }

  return { ...s, log, status, winner };
}

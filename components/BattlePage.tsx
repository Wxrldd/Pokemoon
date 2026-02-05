import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  getMoveDetails,
  getPokemonDetails,
  getOfficialSprite,
  toStatsMap,
  type MoveDetails,
} from "../game/pokeapi";
import { resolveTurn, type BattlePokemon, type BattleState, getActive } from "../game/battleEngine";


type LogKind =
  | "player-action"
  | "enemy-action"
  | "damage"
  | "ko"
  | "info"
  | "result";

function classifyLog(line: string): LogKind {
  if (line.includes("utilise")) {
    return line.startsWith("Ton") ? "player-action" : "enemy-action";
  }
  if (line.includes("perd") && line.includes("PV")) return "damage";
  if (line.includes("K.O")) return "ko";
  if (line.includes("Victoire") || line.includes("Défaite")) return "result";
  return "info";
}

type Props = {
  playerTeamNames?: string[];
  enemyTeamNames?: string[];
};

function hpBar(p: BattlePokemon) {
  const ratio = p.maxHp === 0 ? 0 : p.hp / p.maxHp;
  return `${Math.round(ratio * 100)}%`;
}

async function buildBattlePokemon(name: string, level: number): Promise<BattlePokemon> {
  const details = await getPokemonDetails(name);
  const stats = toStatsMap(details);
  const types = details.types.map((t) => t.type.name);
  const sprite = getOfficialSprite(details);

  const allMoves = details.moves.map((m) => m.move);
  const shuffled = [...allMoves].sort(() => Math.random() - 0.5);
  const pick = shuffled.slice(0, 4);

  const moveDetails: Array<{ name: string; details: MoveDetails; pp: number }> = [];
  for (const mv of pick) {
    try {
      const md = await getMoveDetails(mv.url);
      moveDetails.push({
        name: md.name,
        details: md,
        pp: md.pp ?? 0,
      });
    } catch {
    }
  }

  const maxHp = stats.hp;
  return {
    name: details.name,
    level,
    sprite,
    types,
    stats,
    maxHp,
    hp: maxHp,
    moves: moveDetails,
  };
}

export default function BattlePage(props: Props) {
  const playerNames = useMemo(
    () => props.playerTeamNames ?? ["pikachu", "bulbasaur", "charmander"],
    [props.playerTeamNames]
  );
  const enemyNames = useMemo(
    () => props.enemyTeamNames ?? ["rattata", "pidgey"],
    [props.enemyTeamNames]
  );

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<BattleState | null>(null);
  const [hoverMove, setHoverMove] = useState<MoveDetails | null>(null);

  const logRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const playerTeam = await Promise.all(
        playerNames.map((n, i) => buildBattlePokemon(n, 5 + i * 2))
      );
      const enemyTeam = await Promise.all(enemyNames.map((n, i) => buildBattlePokemon(n, 5 + i * 2)));

      const init: BattleState = {
        player: { team: playerTeam, activeIndex: 0 },
        enemy: { team: enemyTeam, activeIndex: 0 },
        log: [`Un ${enemyTeam[0].name} sauvage apparaît !`, `À toi de jouer.`],
        status: "player_choose",
        winner: null,
      };

      if (alive) {
        setState(init);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [playerNames, enemyNames]);

  if (loading || !state) return <div style={{ padding: 16 }}>Chargement du combat…</div>;

  const player = getActive(state.player);
  const enemy = getActive(state.enemy);

  const canPlay = state.status === "player_choose";

  function onChooseMove(index: number) {
    if (!canPlay) return;
    setState((prev) => {
      if (!prev) return prev;
      const next = resolveTurn({ state: { ...prev, status: "resolving" }, playerMoveIndex: index });
      return next;
    });
  }

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Combat Pokémon</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3>Ton Pokémon</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {player.sprite ? (
              <img src={player.sprite} alt={player.name} width={140} height={140} />
            ) : (
              <div style={{ width: 140, height: 140, background: "#eee" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
                {player.name} <span style={{ fontWeight: 400 }}>Nv. {player.level}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 10, background: "#eee", borderRadius: 999 }}>
                  <div style={{ height: 10, width: hpBar(player), background: "#111", borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  PV: {player.hp}/{player.maxHp}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Types: {player.types.join(", ")}
              </div>
            </div>
          </div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3>Adversaire</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {enemy.sprite ? (
              <img src={enemy.sprite} alt={enemy.name} width={140} height={140} />
            ) : (
              <div style={{ width: 140, height: 140, background: "#eee" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
                {enemy.name} <span style={{ fontWeight: 400 }}>Nv. {enemy.level}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 10, background: "#eee", borderRadius: 999 }}>
                  <div style={{ height: 10, width: hpBar(enemy), background: "#111", borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  PV: {enemy.hp}/{enemy.maxHp}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Types: {enemy.types.join(", ")}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <h3>Choisir une attaque</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {player.moves.map((m, idx) => (
            <button
              key={`${m.name}-${idx}`}
              onClick={() => onChooseMove(idx)}
              disabled={!canPlay || m.pp <= 0 || state.status === "finished"}
              onMouseEnter={() => setHoverMove(m.details)}
              onMouseLeave={() => setHoverMove(null)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ccc",
                background: "white",
                textAlign: "left",
                cursor: canPlay ? "pointer" : "not-allowed",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{m.details.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>PP {m.pp}/{m.details.pp ?? 0}</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>
                Type: {m.details.type.name} • Classe: {m.details.damage_class.name}
                {" • "}
                Puissance: {m.details.power ?? "—"} • Précision: {m.details.accuracy ?? "—"}
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
          {hoverMove ? (
            <div>
              <div style={{ fontWeight: 700 }}>Effet (résumé)</div>
              <div style={{ marginTop: 4 }}>
                {(() => {
                  const fr =
                    hoverMove.effect_entries.find((e) => e.language.name === "fr") ??
                    hoverMove.effect_entries.find((e) => e.language.name === "en") ??
                    hoverMove.effect_entries[0];
                  return fr?.short_effect ?? "Aucune description.";
                })()}
              </div>
            </div>
          ) : (
            <div>Survole un move pour voir ce qu’il fait.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <h3>Journal du combat</h3>
        <div
          ref={logRef}
          style={{
            maxHeight: 260,
            overflowY: "auto",
            background: "#fafafa",
            borderRadius: 12,
            padding: 12,
            border: "1px solid #eee",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {[...state.log].slice(-20).reverse().map((line, i) => {
            const kind = classifyLog(line);

            const style: React.CSSProperties = {
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "85%",
              fontSize: 13,
              lineHeight: 1.4,
              marginBottom: 6,
            };

            if (kind === "player-action") {
              style.background = "#e0f2ff";
              style.alignSelf = "flex-end";
              style.textAlign = "right";
            }

            if (kind === "enemy-action") {
              style.background = "#ffe0e0";
              style.alignSelf = "flex-start";
            }

            if (kind === "damage") {
              style.background = "#f5f5f5";
              style.fontStyle = "italic";
              style.alignSelf = "center";
            }

            if (kind === "ko") {
              style.background = "#000";
              style.color = "white";
              style.fontWeight = 700;
              style.alignSelf = "center";
            }

            if (kind === "result") {
              style.background = "#111";
              style.color = "white";
              style.fontWeight = 800;
              style.alignSelf = "center";
            }

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    kind === "player-action"
                      ? "flex-end"
                      : kind === "enemy-action"
                      ? "flex-start"
                      : "center",
                }}
              >
                <div style={style}>{line}</div>
              </div>
            );
          })}
        </div>

        {state.status === "finished" && (
          <div style={{ marginTop: 12, fontWeight: 800 }}>
            {state.winner === "player" ? "Victoire !" : "Défaite..."}
          </div>
        )}
      </div>
    </div>
  );
}

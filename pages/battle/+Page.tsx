"use client";

import React, { useMemo } from "react";
import BattlePage from "../../components/BattlePage";

export default function Page() {
  const playerTeamNames = useMemo(
    () => ["Aggron", "kyogre", "salamence"],
    []
  );

  const enemyTeamNames = useMemo(
    () => ["rayquaza", "pidgey", "rayquaza"],
    []
  );

  return (
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <BattlePage
        playerTeamNames={playerTeamNames}
        enemyTeamNames={enemyTeamNames}
      />
    </main>
  );
}

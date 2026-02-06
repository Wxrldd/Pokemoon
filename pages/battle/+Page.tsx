"use client";

import React, { useMemo } from "react";
import BattlePage from "../../components/BattlePage";

export default function Page() {
  const playerTeamNames = useMemo(
    () => ["deoxys-speed", "cascoon", "surskit"],
    []
  );

  const enemyTeamNames = useMemo(
    () => ["deoxys-attack", "deoxys-defense", "deoxys-speed"],
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

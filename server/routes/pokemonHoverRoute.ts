import type { Express } from "express";
import { getPokemonHoverCard } from "../../pages/pokedex/PokemonHover.telefunc";

export function registerPokemonHoverRoute(app: Express) {
  app.get("/api/pokemon-hover", async (req, res) => {
    try {
      const nameOrId = String(req.query.nameOrId || "");
      if (!nameOrId) return res.status(400).json({ error: "Missing nameOrId" });

      const data = await getPokemonHoverCard(nameOrId);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });
}

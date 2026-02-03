import type { Config } from "vike/types";
import vikePhoton from "vike-photon/config";
import vikeReact from "vike-react/config";

export default {
  title: "POKEMOOOON",
  description: "Demo showcasing Vike",

  extends: [vikeReact, vikePhoton],

  photon: {
    server: "../server/entry.ts",
  },
} satisfies Config;

import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist",
        format: "es",
        exports: "named",
      },
    ],
    plugins: [typescript(), resolve()],
    external: (id) => /@polkadot/.test(id),
  },
];

export default config;

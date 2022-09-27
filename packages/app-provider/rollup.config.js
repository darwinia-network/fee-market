import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: "src/index.tsx",
    output: [
      {
        dir: "dist",
        format: "es",
        exports: "named",
      },
    ],
    plugins: [typescript(), resolve()],
    external: (id) => /react/.test(id),
  },
];

export default config;

import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
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
    plugins: [resolve(), commonjs(), typescript({ clean: true })],
    external: (id) => /node_modules|@feemarket/.test(id),
  },
];

export default config;

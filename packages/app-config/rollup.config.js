import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import json from "@rollup/plugin-json";

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
    plugins: [resolve(), commonjs(), image(), json(), typescript({ clean: true })],
    external: (id) => /node_modules|@feemarket/.test(id),
  },
];

export default config;

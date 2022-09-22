import typescript from "rollup-plugin-typescript2";

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
    plugins: [typescript()],
    external: (id) => /@polkadot/.test(id),
  },
];

export default config;

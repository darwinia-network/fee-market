/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "../darwinia-ui/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: "#FF0083",
      black: "#1A1D1F",
      blackSecondary: "#242A2E",
      gray: "#C6C6C6",
      white: "#FFFFFF",
      halfWhite: "rgba(255, 255, 255, 0.5)",
      halfPrimary: "rgba(255,0,131,0.5)",
      divider: "rgba(255, 255, 255, 0.2)",
      link: "#0094FF",
      danger: "#FF2D20",
      success:"#42FF00",
      warning: "#FFB732"
    },
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
      // Add a `third` variant, ie. `third:pb-0`
      addVariant("3n", "&:nth-child(3n)");
      addVariant("3n-2", "&:nth-child(3n-2)");
      addVariant("first-item", "&:nth-child(1)");
    }),
  ],
}

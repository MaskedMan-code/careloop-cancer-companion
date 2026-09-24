import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        care: {
          dark: "#0B3D3F",
          dark2: "#0F4C4A",
          teal: "#028090",
          green: "#00A896",
          mint: "#02C39A",
          tint: "#EAF6F4",
          tint2: "#DCEEEB",
          border: "#BFE0DB",
          muted: "#5B7370",
          text: "#16302E",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 6px 20px -8px rgba(11, 61, 63, 0.18)",
        soft: "0 2px 10px -4px rgba(11, 61, 63, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;

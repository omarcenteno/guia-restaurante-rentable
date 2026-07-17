import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#071423",
        ink: "#11202f",
        cream: "#f7f4ee",
        gold: "#c8a45d",
        terracotta: "#bd5b36"
      },
      boxShadow: {
        editorial: "0 24px 80px rgba(7, 20, 35, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;

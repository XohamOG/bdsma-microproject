import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nouveau: {
          teal: "#008080",
          gold: "#CFB53B",
          mauve: "#E0B0FF",
          ivory: "#FFFFF0",
          olive: "#808000",
          burgundy: "#800020",
          peacock: "#005F9E",
          cream: "#FFFDD0",
          charcoal: "#1A1A18",
          dark: "#121816",
          border: "#D8C785",
        },
      },
      fontFamily: {
        display: ["Quattrocento", "serif"],
        body: ["Quattrocento", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        nouveau: "0 2px 12px rgba(26, 26, 24, 0.06)",
        "nouveau-gold": "0 4px 20px rgba(207, 181, 59, 0.22)",
        "nouveau-lift": "0 8px 24px rgba(0, 128, 128, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;

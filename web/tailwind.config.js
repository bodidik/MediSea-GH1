import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // 👇 JSON İÇİNDEKİ RENKLERİ GÖRMESİ İÇİN BU GEREKLİ:
    "./content/**/*.{json,js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.slate.700"),
            fontFamily: theme("fontFamily.sans").join(","),
            h1: {
              fontFamily: theme("fontFamily.serif").join(","),
              fontWeight: "800",
              color: theme("colors.slate.900"),
            },
            h2: {
              fontFamily: theme("fontFamily.serif").join(","),
              fontWeight: "700",
              color: theme("colors.slate.800"),
              marginTop: "2em",
              marginBottom: "1em",
            },
            h3: {
              fontFamily: theme("fontFamily.serif").join(","),
              fontWeight: "600",
              color: theme("colors.slate.800"),
            },
            "ul > li::marker": {
              color: theme("colors.blue.500"),
            },
            code: {
              fontFamily: theme("fontFamily.mono").join(","),
              backgroundColor: theme("colors.slate.100"),
              padding: "2px 4px",
              borderRadius: "4px",
              fontWeight: "600",
            },
            img: {
              borderRadius: "0.75rem",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
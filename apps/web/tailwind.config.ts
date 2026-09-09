import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18181b",
        paper: "#f8fafc",
        accent: "#256d5a"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        diffusion: "0 24px 70px -45px rgba(24, 24, 27, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;

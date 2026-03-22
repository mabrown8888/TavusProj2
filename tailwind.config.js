/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          bg: "#0D0D14",
          card: "#16161F",
          border: "#2A2A3A",
          gold: "#C9A84C",
          goldLight: "#E8C86A",
          muted: "#6B6B8A",
        },
      },
    },
  },
  plugins: [],
};

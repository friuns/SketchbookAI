/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./codeEditor.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  corePlugins: {
    preflight: false,
  },
  daisyui: {
    themes: ["light", "dark"],
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./3dPicker.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  corePlugins: {
    preflight: false,
  },
}

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
    // Disable preflight (CSS reset) to avoid conflicts with existing styles
    preflight: false,
  },
}

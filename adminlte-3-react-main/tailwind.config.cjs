/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan all React files
  ],
  theme: {
    extend: {
      colors: {
        blue: "#0073b7",
        lightblue: "#3c8dbc",
        navy: "#001f3f",
        teal: "#39cccc",
        olive: "#3d9970",
        lime: "#01ff70",
        orange: "#ff851b",
        fuchsia: "#f012be",
        purple: "#605ca8",
        maroon: "#d81b60",
        black: "#111",
        "gray-x-light": "#d2d6de",
      },
      spacing: {
        "sidebar-width": "250px",
      },
      zIndex: {
        1000: "1000",
        9999: "9999",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#15131A",
          darker: "#08070B",
          blue: "#718CF5",
          ice: "#211F27",
          accent: "#FFD84A",
          orange: "#FF7417",
        },
        aqua: {
          50: "#342D1B",
          100: "#49401F",
          200: "#806B2B",
          300: "#B38A20",
          400: "#FFE477",
          500: "#FFD84A",
          600: "#E6A900",
          700: "#C98A00",
          800: "#F5E2A2",
          900: "#FFF0BE",
        },
      },
    },
  },
  plugins: [],
};

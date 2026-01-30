/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F2F5FA", // Light gray background from screenshots
        surface: "#FFFFFF",
        'surface-hover': "#F9FAFB",
        primary: "#1A56DB", // Professional Kavak Blue
        accent: "#000000",
        text: "#000000",
        'text-secondary': "#6B7280",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        kavak: "16px", // Much more rounded as seen in screenshots
        'kavak-pill': "9999px",
      },
      boxShadow: {
        'kavak': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'kavak-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          card: {
            DEFAULT: "white",
            foreground: "black",
          },
        },
      },
    },
    plugins: [],
  }
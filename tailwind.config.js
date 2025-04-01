/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          grotesk: ['"Space Grotesk"', 'sans-serif'],
          dm: ['"DM Sans"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
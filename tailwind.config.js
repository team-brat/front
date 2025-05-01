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
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl1280: '1280px',
        xl: '1440px',
        '2xl': '1536px',
      },
    },
    plugins: [],
  }
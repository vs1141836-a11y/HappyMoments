/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8eb',
          100: '#f5ecce',
          200: '#ebda9d',
          300: '#dec263',
          400: '#d4af37', // Premium gold
          500: '#b89228',
          600: '#96711d',
          700: '#745217',
          800: '#543912',
          900: '#39250b',
        },
        navy: {
          800: '#0B192C',
          900: '#1E3E62',
          950: '#000814',
        },
        champagne: {
          50: '#FAF9F6',
          100: '#F4EAD4',
          200: '#EBDCB9',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -15px rgba(212, 175, 55, 0.15)',
        'luxury-lg': '0 20px 40px -15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

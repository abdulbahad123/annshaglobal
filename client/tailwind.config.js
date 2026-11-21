/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        annsha: {
          bg: '#FBF7F0',
          card: '#FFFDF9',
          border: '#F0E7DB',
          primary: '#704214',
          'primary-hover': '#59330E',
          accent: '#C59B27',
          dark: '#231710',
          text: '#2B1E16',
          muted: '#7A6E65',
          pill: '#F5EBE1',
          sale: '#B93822'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'luxury': '0 8px 30px rgba(112, 66, 20, 0.06)',
        'luxury-hover': '0 14px 40px rgba(112, 66, 20, 0.12)',
        'drawer': '0 20px 40px rgba(35, 23, 16, 0.2)'
      }
    },
  },
  plugins: [],
}


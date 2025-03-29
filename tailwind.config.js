/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gray-750': '#2D3748',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'paper': "url('https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4c1?auto=format&fit=crop&q=80&w=2000&h=2000')",
      },
    },
  },
  plugins: [],
};
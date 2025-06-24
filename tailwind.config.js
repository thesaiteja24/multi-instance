/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ← shimmer keyframes
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      // ← shimmer animation
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },

      boxShadow: {
        custom: '0px 4px 4px 0px #00000040',
      },
      fontFamily: {
        afacad: ['Afacad', 'sans-serif'],
      },
      letterSpacing: {
        '8px': '8px',
        '10px': '10px',
      },
      screens: {
        xs: '375px',
        xm: '425px', // small devices like mobile
        sm: '640px', // tablets
        md: '768px', // small laptops
        lg: '1024px',
        'xl-custom': '1200px', // desktops
        xl: '1280px', // larger desktops
        '2xl': '1536px', // very large screens
        '3xl': '1700px',
      },
      gridTemplateColumns: {
        100: '68% 32%',
      },
      gridColumn: {
        68: 'span 1 / span 1',
        32: 'span 1 / span 1',
      },
    },
  },
  plugins: [],
};

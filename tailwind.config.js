/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
            'background-image': 'linear-gradient(to right, #f97316, #fbbf24)',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
            'background-image': 'linear-gradient(to right, #fbbf24, #f97316)',
          },
        },
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', 'sans-serif'],
        'sans': ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
    variants: {
      extend: {
        scrollbar: ['rounded']
      }
    },
  },
  plugins: [],
}
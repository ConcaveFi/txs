const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./**/*.tsx'],
  theme: {
    extend: {
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        lg: '12px',
      },
      boxShadow: {
        DEFAULT: '0px 4px 24px rgba(0, 0, 0, 0.10)',
      },
      colors: {
        grey: colors.neutral,
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
}

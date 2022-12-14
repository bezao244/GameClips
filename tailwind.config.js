/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/aspect-ratio")
  ],
  purge: {
    content: [
      './src/**/*.{html, ts}',
    ],
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgorundColor: ['disabled']
    },
  }
}

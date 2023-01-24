const config = require('../../.prettierrc.js')

/** @type {import('prettier').Config} */
module.exports = {
  ...config,
  plugins: [require('prettier-plugin-tailwindcss')],
}

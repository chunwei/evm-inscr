/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-09 23:33:23
 * @LastEditTime: 2023-05-13 12:38:29
 * @LastEditors: luchunwei luchunwei@gmail.com
 */
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './UI/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1360px'
      }
    },
    extend: {
      colors: {
        blue: {
          framer: 'rgb(0 153 255)',
          framerhover: 'rgb(0 153 255 / 68%)',
          frameractive: 'rgb(0 133 222)'
        },
        purple: {
          framer: 'rgb(204 0 255)',
          framerhover: 'rgb(204 0 255 / 68%)',
          frameractive: 'rgb(185 0 231)'
        }
      },
      boxShadow: {
        framer:
          'rgba(135, 93, 255, 0.584) 0.398096px 0.398096px 0.562993px -0.9375px, rgba(135, 93, 255, 0.553) 1.20725px 1.20725px 1.70731px -1.875px, rgba(135, 93, 255, 0.47) 3.19133px 3.19133px 4.51322px -2.8125px, rgba(135, 93, 255, 0.2) 10px 10px 14.1421px -3.75px'
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans, { fontFeatureSettings: 'normal' }]
      }
    }
  },
  plugins: []
}

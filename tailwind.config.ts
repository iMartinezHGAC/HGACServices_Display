import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
      fontFamily: {
        staatliches: ['Staatliches', 'system-ui'],
        poppins: ['Poppins', 'san-serif'],
        yeseva: ['Yeseva One', 'system-ui'],
        fraunces: ['Fraunces Variable', 'serif'],
        patua: ['Patua One', 'system-ui'],
        metropolis: ['Metropolis', 'sans-serif'],
      },
      boxShadow: {
        'shadow-text': '2px 2px 4px rgba(0,0,0,0.1)'
      },
      colors: {
        'hgac-red': '#C6093B',
        'hgac-slate': '#002F47',
        'hgac-blue': '#025773',
        'hgac-gray': '#B4B4B4',
        'hgac-green': '#7AB66F',
        'hgac-lightblue': '#25B5AF',
        'hgac-orange': '#EF9021'
      }
    }
	},

	plugins: [typography, forms]
} satisfies Config;

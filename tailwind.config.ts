import type { Config } from 'tailwindcss';

export default {
  content: ['src/**/*.{html,js,jsx,ts,tsx}'],
  // Scope utilities under the ts-resource root so they override Mapbox popup defaults
  important: '#ts-resource-map',
} satisfies Config;

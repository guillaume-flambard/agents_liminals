/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Agent Colors
        accordeur: {
          primary: '#5dade2',
          secondary: '#bb8fce',
          background: '#0c1426',
          surface: '#1a252f',
          border: 'rgba(93, 173, 226, 0.6)',
        },
        peseur: {
          primary: '#e67e22',
          secondary: '#f39c12',
          background: '#2c1810',
          surface: '#3d2817',
          border: 'rgba(230, 126, 34, 0.6)',
        },
        denoueur: {
          primary: '#e74c3c',
          secondary: '#c0392b',
          background: '#2c1618',
          surface: '#3d1f21',
          border: 'rgba(231, 76, 60, 0.6)',
        },
        evideur: {
          primary: '#f1c40f',
          secondary: '#f39c12',
          background: '#2c2416',
          surface: '#3d3120',
          border: 'rgba(241, 196, 15, 0.6)',
        },
        habitant: {
          primary: '#9b59b6',
          secondary: '#8e44ad',
          background: '#1f1626',
          surface: '#2b1f33',
          border: 'rgba(155, 89, 182, 0.6)',
        },
        // General theme
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        radius: 'var(--radius)',
      },
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'harmonic-slide-in': 'harmonicSlideIn 0.6s ease',
        'harmonic-pulse': 'harmonicPulse 1.5s ease-in-out infinite',
        'frequency-wave': 'frequencyWave 3s ease-in-out infinite',
      },
      keyframes: {
        harmonicSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.98)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'translateY(-5px) scale(1.01)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        harmonicPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '1',
          },
        },
        frequencyWave: {
          '0%, 100%': {
            height: '60px',
            opacity: '0.4',
          },
          '50%': {
            height: '80px',
            opacity: '0.7',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
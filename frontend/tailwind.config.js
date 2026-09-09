/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        nova: {
          // Dark backgrounds
          bg: '#0a0a0f',
          'bg-alt': '#12121a',
          surface: '#1a1a2e',
          'surface-light': '#242440',
          // Borders
          border: 'rgba(139, 92, 246, 0.15)',
          'border-strong': 'rgba(139, 92, 246, 0.3)',
          // Text
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
          'text-bright': '#f8fafc',
          // Accent – violet/indigo spectrum
          accent: '#8b5cf6',
          'accent-light': '#a78bfa',
          'accent-dark': '#7c3aed',
          'accent-glow': 'rgba(139, 92, 246, 0.4)',
          // Secondary accents
          indigo: '#6366f1',
          cyan: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'nova-gradient': 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #22d3ee 100%)',
        'nova-gradient-subtle': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(34, 211, 238, 0.05) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(18, 18, 26, 0.9) 100%)',
      },
      boxShadow: {
        'nova': '0 0 30px rgba(139, 92, 246, 0.15)',
        'nova-lg': '0 0 60px rgba(139, 92, 246, 0.2)',
        'nova-glow': '0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(99, 102, 241, 0.1)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'spin-slow': 'spin 20s linear infinite',
        'counter-up': 'counterUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(99, 102, 241, 0.15)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        counterUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

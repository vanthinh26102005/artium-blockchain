/* eslint-disable @typescript-eslint/no-require-imports */
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  content: [
    // includes
    './pages/**/*.tsx',
    './components/**/*.tsx',
    './shared/**/*.tsx',
    './views/**/*.tsx',
    './src/**/*.tsx',
    './app/**/*.tsx',
    './@customWebsite/**/*.tsx',

    // excludes
    '!./**/node_modules',
    '!./.next',
    '!./out',
    '!./certs',
    '!./.github',
    '!./.git',
    '!./public',
    '!./shared/types',
  ],
  theme: {
    fontFamily: {
      ...defaultTheme.fontFamily,
      beni: ['Beni', 'Icons', 'Roboto', 'sans-serif'],
      inter: ['Inter', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      icons: ['Icons', 'Roboto', 'sans-serif'],
      'avenir-next': ['Avenir Next', 'sans-serif'],
      'nimbus-sans': ['Nimbus Sans', 'sans-serif'],
      'monument-grotes': ['Monument-Grotes', 'Icons'],
      'monument-grotes-mono': ['Monument-Grotes-Mono', 'Icons'],
      'monument-grotesk-ultra': ['Monument-Grotesk-Ultra', 'Roboto', 'sans-serif'],
      'happy-times': ['Happy-Times-at-the-ikob', 'sans-serif'],
      poppins: ['Poppins', 'sans-serif'],
      spartan: ['Spartan', 'sans-serif'],
    },
    screens: {
      se: '376px',
      xs: '475px',
      '2xl': '1536px',
      '3xl': '1940px',
      '4xl': '2580px',
      ...defaultTheme.screens,
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
      },
    },
    containers: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1940px',
      '4xl': '2580px',
    },
    boxShadow: {
      'artium-sm': '0px 0px 15px rgba(0, 0, 0, 0.1)',
      'artium-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
      'artium-lg': '0px 2px 30px rgba(0, 0, 0, 0.25)',
      'artium-xl': '0px 0px 40px rgba(0, 0, 0, 0.2)',
      image: '0px 5px 10px -4px rgba(16, 24, 40, 0.1)',
      user1: '0px 4px 18px 1px rgba(182, 184, 103, 1)',
      user2: '0px 4px 18px 1px rgba(15, 107, 255, 1)',
      user3: '0px 4px 18px 1px rgba(254, 55, 0, 1)',
      user4: '0px 4px 18px 1px rgba(1, 155, 103, 1)',
      user5: '0px 4px 18px 1px rgba(104, 48, 14, 1)',
      user6: '0px 4px 18px 1px rgba(255, 94, 196, 1)',
      user7: '0px 4px 18px 1px rgba(177, 172, 165, 1)',
      user8: '0px 4px 18px 1px rgba(0, 217, 115, 1)',
      user9: '0px 4px 18px 1px rgba(163, 33, 0, 1)',
      user10: '0px 4px 18px 1px rgba(2, 84, 194, 1)',
      user11: '0px 4px 18px 1px rgba(250, 237, 143, 1)',
      user12: '0px 4px 18px 1px rgba(184, 94, 0, 1)',
      user13: '0px 4px 18px 1px rgba(168, 255, 143, 1)',
      'inner-tagpill': 'inset -3px -3px 0px 0px black',
      tagpill: '3px 3px 0px 0px #000000',
      ...defaultTheme.boxShadow,
    },
    extend: {
      zIndex: {
        100: '100',
        110: '110',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '1/2': '1 / 2',
        '2/1': '2 / 1',
        '4/3': '4 / 3',
        '9/16': '9 / 16',
        '16/10': '16 / 10',
        artwork: '4 / 5',
      },
      colors: {
        cherup: '#f2c2f2',
        'cornflower-blue': '#2351fc',
        'neon-green': '#e6ff00',
        malachite: '#0fb73e',
        mariner: '#2259e0',
        'spring-wood': '#f7f7f0',
        'electric-blue': '#0000ff',
        'green-haze': '#019b67',
        sulu: '#cdea6a',
        'screaming-green': '#6cff42',
        'mint-green': '#a8ff8f',
        'brand-green': '#00D973',
        'celtic-blue': '#2467D8',
        'drawer-light-gray': '#F9F9F9',
        'light-red': '#FF5C5C',
        'light-gray': '#E9E9E9',
        background: 'hsl(var(--background))',
        'text-gray': '#808080',
        'kokushoku-black': '#191414',
        'auth-error': '#FF4337',
        'auth-label': '#6b6b6b',
        error: '#FF0000',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        helper: 'rgba(0,0,0,0.4)',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: 'hsl(var(--success))',
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        link: 'var(--link)',
      },
      animation: {
        fadein: '2s linear 1s 1 normal forwards running fadein',
        fadeinshort: '1s linear 0s 1 normal forwards running fadeinshort',
        'madlib-imagepreview': '0.5s linear 0s 1 normal forwards running fadeinshort',
        'slide-left': '1s ease 1s 1 normal forwards running slide-left',
        'slide-right': '1s ease 1s 1 normal forwards running slide-right',
        'slide-up': '1s ease 1s 1 normal forwards running slide-up',
        'slide-up-quick': '0.2s ease 0s 1 normal forwards running slide-up-quick',
        'scrolling-text': 'scroll 60s linear infinite',
        'bounce-right': '1s ease bounce-right infinite',
        slideUp: 'slideUp 0.5s ease-in-out',
        slideDown: 'slideDown 0.5s ease-in-out',
        slideUpFromBottom: 'slideUpFromBottom 0.5s ease-in-out forwards',
        marquee: 'marquee var(--duration) infinite linear',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s linear',
        'collapsible-up': 'collapsible-up 0.2s linear',
        'modal-fade-in': 'modal-fade-in 500ms ease-out',
        'modal-fade-out': 'modal-fade-out 500ms ease-in',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-right': 'slide-out-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadein: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        fadeinshort: {
          from: {
            opacity: 0.3,
          },
          to: {
            opacity: 1,
          },
        },
        'slide-left': {
          from: {
            transform: 'translate(-25%,0)',
            opacity: 0.3,
          },
          to: {
            transform: 'translate(0,0)',
            opacity: 1,
          },
        },
        scroll: {
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(100%)',
          },
        },
        'slide-right': {
          from: {
            transform: 'translate(25%,0)',
            opacity: 0.3,
          },
          to: {
            transform: 'translate(0,0)',
            opacity: 1,
          },
        },
        'slide-up': {
          from: {
            transform: 'translateY(100%)',
            opacity: 0.3,
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
        'slide-up-quick': {
          from: {
            transform: 'translateY(100%)',
            opacity: 0.6,
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
        'bounce-right': {
          '0%, 100%': {
            transform: 'translateX(25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        slideUp: {
          '0%': {
            transform: 'translateY(100%)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
        slideUpFromBottom: {
          '0%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
        },
        slideDown: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
        marquee: {
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(calc(-100% - var(--gap)))',
          },
        },
        'marquee-vertical': {
          from: {
            transform: 'translateY(0)',
          },
          to: {
            transform: 'translateY(calc(-100% - var(--gap)))',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'collapsible-down': {
          from: {
            height: '0',
            opacity: 0,
          },
          to: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: 1,
          },
        },
        'collapsible-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: 1,
          },
          to: {
            height: '0',
            opacity: 0,
          },
        },
        'modal-fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'modal-fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        'slide-out-right': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      gridTemplateColumns: {
        profile: 'auto 1fr',
        '6/4': '3fr 2fr',
      },
      transitionProperty: {
        snapshot: 'margin, top, right, bottom, left, width, height, opacity',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      'artium-sm': '10px',
      'artium-lg': '30px',
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('@headlessui/tailwindcss'),
    require('tailwindcss-animate'),
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling',
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: {
          implementation: require.resolve('postcss'),
        },
      },
    },
  ],
}

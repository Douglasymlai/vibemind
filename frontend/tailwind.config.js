/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0A0A0A",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        information: {
          DEFAULT: "hsl(218 100% 87%)",
          foreground: "hsl(218 100% 57%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'dialog': '0 726px 203px 0 rgba(41, 41, 41, 0.00), 0 464px 186px 0 rgba(41, 41, 41, 0.01), 0 261px 157px 0 rgba(41, 41, 41, 0.03), 0 116px 116px 0 rgba(41, 41, 41, 0.05), 0 29px 64px 0 rgba(41, 41, 41, 0.05)',
        'card': '0 71px 20px 0 rgba(110, 110, 110, 0.00), 0 46px 18px 0 rgba(110, 110, 110, 0.02), 0 26px 15px 0 rgba(110, 110, 110, 0.05), 0 11px 11px 0 rgba(110, 110, 110, 0.09), 0 3px 6px 0 rgba(110, 110, 110, 0.10)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
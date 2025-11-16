/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Active le mode sombre via la classe "dark"
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        gothic: ['Century Gothic', 'sans-serif'],
      },
      colors: {
        'grey-primary': '#f0f0f0', // devient: bg-grey-primary, text-grey-primary, etc.
        'yellow-primary': 'goldenrod',
        'orange-primary': 'darkorange',
        'green-primary': 'mediumseagreen',
      },
    },
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        light: {
          primary: "#000000", // Couleur text
          secondary: "#2563EB", // Couleur shadow
          accent: "#2563EB", // Couleur bouton
          neutral: "#161B2A", // Couleur de l'input
          "base-100": "#EDECF2", // Couleur background
          Input: "#ffffff", // Couleur de l'input
        },
      },
      {
        dark: {
          primary: "#ffffff", 
          secondary: "#2563EB", 
          accent: "#2563EB", 
          neutral: "#161B2A",
          "base-100": "#0E121E", 
          Input: "#161B2A",
        },
      },
    ],
  },
};
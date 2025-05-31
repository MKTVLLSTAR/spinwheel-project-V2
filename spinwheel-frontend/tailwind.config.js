/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      animation: {
        "spin-wheel":
          "spin-wheel var(--duration, 4s) cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "bounce-in": "bounce-in 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        "spin-wheel": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(var(--rotation, 1440deg))" },
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0.3)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.05)",
          },
          "70%": {
            transform: "scale(0.9)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(102, 126, 234, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(102, 126, 234, 0.6)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        spinwheel: {
          primary: "#dc2626", // สีแดง
          secondary: "#fbbf24", // สีทอง
          accent: "#f59e0b", // สีทองเข้ม
          neutral: "#374151", // สีเทาเข้ม
          "base-100": "#ffffff", // พื้นหลังขาว
          "base-200": "#f3f4f6", // พื้นหลังเทาอ่อน
          "base-300": "#e5e7eb", // พื้นหลังเทา
          info: "#3b82f6", // สีฟ้า
          success: "#10b981", // สีเขียว
          warning: "#f59e0b", // สีเหลือง
          error: "#ef4444", // สีแดงผิดพลาด
        },
      },
    ],
  },
};

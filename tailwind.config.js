/** @type {import('tailwindcss').Config} */

import tailwindThemeVarDefine from './src/themes/tailwind-theme-var-define.js'

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"], // 解析内容，指向项目中所有的 HTML 文件和 TypeScript/JavaScript 文件
  theme: {
    extend: {
        colors: {
            gray: {
                25: '#fcfcfd',
                50: '#f9fafb',
                100: '#f2f4f7',
                200: '#eaecf0',
                300: '#d0d5dd',
                400: '#98a2b3',
                500: '#667085',
                700: '#475467',
                600: '#344054',
                800: '#1d2939',
                900: '#101828',
            },
            blue: {
                500: '#E1EFFE',
            },
            green: {
                50: '#F3FAF7',
                100: '#DEF7EC',
                800: '#03543F',
            },
            yellow: {
                100: '#FDF6B2',
                800: '#723B13',
            },
            purple: {
                50: '#F6F5FF',
                200: '#DCD7FE',
            },
            // 先保留变量直指（DEFAULT 会由我们生成的 palette 再覆盖为 DEFAULT: var(--...)）
            ...tailwindThemeVarDefine,
        },
        boxShadow: {
            'xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            'sm': '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
            'md': '0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10)',
            'lg': '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
            'xl': '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
            '2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
            '3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
        },  // 扩展阴影效果
        opacity: {
            2: '0.02',
            8: '0.08',
        },  // 新增 2 和 8 两个不透明度
        fontSize: {
            '2xs': '0.625rem',
        },
        animation: {
            'spin-slow': 'spin 2s linear infinite',
        },
    },
  },
  plugins: [],
}
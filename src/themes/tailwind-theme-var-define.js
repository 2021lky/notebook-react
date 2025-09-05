import fs from 'node:fs';
import path from 'node:path';

// css变量映射表
const vars = {
  'primary': 'var(--primary)',
  'secondary': 'var(--secondary)',
  'tertiary': 'var(--tertiary)',

  'border-color': 'var(--border-color)',
  'border-dark': 'var(--border-dark)',

  'bg-primary': 'var(--bg-primary)',
  'bg-secondary': 'var(--bg-secondary)',

  'text-primary': 'var(--text-primary)',
  'text-secondary': 'var(--text-secondary)',
  'text-tertiary': 'var(--text-tertiary)',
  'text-quaternary': 'var(--text-quaternary)',
  'text-quinary': 'var(--text-quinary)',
  'text-disabled': 'var(--text-disabled)',
  
  'success': 'var(--success)',
  'warning': 'var(--warning)',
  'error': 'var(--error)',
  'info': 'var(--info)',
}

// 生成色阶的比例映射（严格按照你的要求）
const SHADE_FACTORS = {
  50: 0.95,
  100: 0.9,
  200: 0.7,
  300: 0.5,
  400: 0.3,
  500: 0,
  600: 0.1,
  700: 0.25,
  800: 0.4,
  900: 0.6,
  950: 0.8,
};

// 生成运行时色阶表达式（随 var(--xxx) 和 data-theme 动态变化）
function makeRuntimeMixShades(varRef) {
  const shades = {};
  for (const [k, v] of Object.entries(SHADE_FACTORS)) {
    const key = Number(k);
    if (key === 500) {
      shades[key] = varRef; // 中值直接用基础变量
    } else if (key < 500) {
      // 变浅：与白色混合
      shades[key] = `color-mix(in oklab, ${varRef}, white ${v * 100}%)`;
    } else {
      // 变深：与黑色混合
      shades[key] = `color-mix(in oklab, ${varRef}, black ${v * 100}%)`;
    }
  }
  return shades;
}

// 汇总导出：所有在 vars 中声明的颜色都会拥有 DEFAULT + 50..950
const generatedPalettes = {};
Object.keys(vars).forEach((name) => {
  const varRef = vars[name]; // 'var(--primary)' 等
  generatedPalettes[name] = {
    DEFAULT: varRef,
    ...makeRuntimeMixShades(varRef),
  };
});

export default generatedPalettes

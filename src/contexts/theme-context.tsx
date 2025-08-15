import { FC, ReactNode, useCallback, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'
import { hexToRGBA, hexToRGB, darkenColor } from '@/utils/theme'
import useThemeStore from '@/stores/use-theme-store'

// 3. 计算浅色变体：在原RGB基础上混合白色（提高明度）
const getLightColor = (rgb: { r: number; g: number; b: number }, lightness = 0.9) => {
// lightness 0.9 表示 90% 白色 + 10% 主题色（值越大越浅）
const r = Math.round(rgb.r * (1 - lightness) + 255 * lightness);
const g = Math.round(rgb.g * (1 - lightness) + 255 * lightness);
const b = Math.round(rgb.b * (1 - lightness) + 255 * lightness);
return `rgb(${r}, ${g}, ${b})`;
};
export class Theme {
  public colorTheme: string  // 存储主题颜色
  public colorThemeInverted: boolean  // 是否是反色主题，黑体白字

  constructor(colorTheme: string, colorThemeInverted = false) {
    this.colorTheme = colorTheme
    this.colorThemeInverted = colorThemeInverted
    this.updateCSSVariables()
  }

  // 动态更新 CSS 变量
  private updateCSSVariables() {
    const root = document.documentElement
    
    // 更新主题色相关变量
    root.style.setProperty('--primary-color', this.colorTheme)
    
    // 计算 RGB 值用于透明度处理
    const rgb = hexToRGB(this.colorTheme)
    if (rgb) {
      root.style.setProperty('--primary-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
      root.style.setProperty('--bg-primary', `${getLightColor(rgb, 0.95)}`)
      root.style.setProperty('--bg-secondary', `${getLightColor(rgb, 0.85)}`)
      root.style.setProperty('--bg-tertiary', `${getLightColor(rgb, 0.65)}`)
    }
    
    // 更新悬停和激活状态颜色
    root.style.setProperty('--primary-hover', darkenColor(this.colorTheme, 0.1))
    root.style.setProperty('--primary-active', darkenColor(this.colorTheme, 0.2))
    
    // 更新背景色
    if (this.colorTheme) {
      root.style.setProperty('--bg-rounded', hexToRGBA(this.colorTheme, 0.05))
      root.style.setProperty('--bg-bubble', hexToRGBA(this.colorTheme, 0.15))
    }
    
    // 更新反色主题样式
    if (this.colorThemeInverted) {
      root.style.setProperty('--bg-primary', this.colorTheme)
      root.style.setProperty('--text-primary', '#ffffff')
    } else {
      root.style.setProperty('--text-primary', '#1e293b')
    }
  }
  
}

type ThemeContextValue = {
  theme: Theme;
  triggerTheme: (colorTheme: string, colorThemeInverted?: boolean) => void;
}
const ThemeContext = createContext<ThemeContextValue>({
  theme: new Theme("#1C64F2", false),
  triggerTheme: () => {},
})
export const useThemeContext = () => useContext(ThemeContext)

export type ThemeContextProviderProps = {
  children: ReactNode
}

const ThemeContextProvider: FC<ThemeContextProviderProps> = ({children}) => {
  const { theme: themeSetting, setTheme: setStoreTheme } = useThemeStore()
  const [theme, setTheme] = useState(new Theme(themeSetting.colorTheme, themeSetting.colorThemeInverted))

  const triggerTheme = useCallback((colorTheme: string, colorThemeInverted = false) => {
    setStoreTheme({ colorTheme, colorThemeInverted })
    const newTheme = new Theme(colorTheme, colorThemeInverted)
    setTheme(newTheme)
  }, [setStoreTheme, setTheme])
  
  return (
    <ThemeContext.Provider value={{ theme, triggerTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
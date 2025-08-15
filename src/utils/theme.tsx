// 将 16 进制色值（如 #ffffff）转换为带透明度的 RGBA 颜色字符串
export function hexToRGBA(hex: string, opacity: number): string {
  hex = hex.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  // Returning an RGB color object
  return `rgba(${r},${g},${b},${opacity.toString()})`
}
// 将 CSS 样式字符串（如 "color: red; font-size: 16px"）转换为 React 样式对象
export function CssTransform(cssString: string): object {
  if (cssString.length === 0)
    return {}

  const style: object = {}
  const propertyValuePairs = cssString.split(';')
  for (const pair of propertyValuePairs) {
    if (pair.trim().length > 0) {
      const [property, value] = pair.split(':')
      Object.assign(style, { [property.trim()]: value.trim() })
    }
  }
  return style
}

  // 将十六进制颜色转换为 RGB
  export const hexToRGB = (hex: string): { r: number; g: number; b: number } | null =>{
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  // 加深颜色
  export const darkenColor = (hex: string, amount: number): string => {
    const rgb = hexToRGB(hex)
    if (!rgb) return hex
    
    const darken = (value: number) => Math.max(0, Math.floor(value * (1 - amount)))
    const r = darken(rgb.r).toString(16).padStart(2, '0')
    const g = darken(rgb.g).toString(16).padStart(2, '0')
    const b = darken(rgb.b).toString(16).padStart(2, '0')
    
    return `#${r}${g}${b}`
  }

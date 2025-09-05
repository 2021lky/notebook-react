import { ReactNode, useState, createContext, useContext, useEffect } from "react";


type ThemeContextType = {
  theme: "default" | "dark" | "green" | "orange" | "purple";
  setTheme: (theme: "default" | "dark" | "green" | "orange" | "purple") => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
})

export const useTheme = () => {
  return useContext(ThemeContext) as ThemeContextType;
}

const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeContextType["theme"]>(() => {
      if (typeof window === "undefined") return "default"; // SSR 安全兜底
      const t = localStorage.getItem("theme");
      if (t === "default" || t === "dark" || t === "green" || t === "orange" || t === "purple") {
        return t as ThemeContextType["theme"]; // 通过字面量比较后安全断言为联合类型
      }
      return "default";
    });
  
    useEffect(() => {
      localStorage.setItem("theme", theme);
      //  <html> 元素上设置 data-theme 来切换主题
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
  
    return (
      <ThemeContext.Provider value={{ theme, setTheme: setTheme }}>
        {children}
      </ThemeContext.Provider>
    )
}

export default ThemeProvider;

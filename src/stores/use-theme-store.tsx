import { create} from "zustand"
import { LOCAL_STORAGE_THEME } from "@/constant";

export type Theme = {
    colorTheme: string;  // 主题颜色
    colorThemeInverted: boolean;  // 是否反转
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: {
    colorTheme: localStorage.getItem(LOCAL_STORAGE_THEME) ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_THEME)!).colorTheme : "#1C64F2",
    colorThemeInverted: localStorage.getItem(LOCAL_STORAGE_THEME) ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_THEME)!).colorThemeInverted : false,
  },
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem(LOCAL_STORAGE_THEME, JSON.stringify(theme));
  },
}));

export default useThemeStore;

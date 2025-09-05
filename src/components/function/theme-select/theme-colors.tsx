import { useTranslation } from 'react-i18next';

export type ThemeColor = {
  name: string;
  value: string;
  primary: string;
}

// 应从后端获取主题列表，这里为了方便前端写死
const getThemeColors = (): ThemeColor[] => {
  const { t } = useTranslation();
  
  return [
    {
      name: t('common.themes.defaultBlue'),
      value: "default",
      primary: "#409eff",
    },
    {
      name: t('common.themes.vibrantOrange'),
      value: "orange",
      primary: "#f97316",
    },
    {
      name: t('common.themes.freshGreen'),
      value: "green",
      primary: "#10b981"
    },
    {
      name: t('common.themes.elegantPurple'),
      value: "purple",
      primary: "#8b5cf6"
    },
    {
      name: t('common.themes.deepDark'),
      value: "dark",
      primary: "#0f172a"
    }
  ];
};

export default getThemeColors;
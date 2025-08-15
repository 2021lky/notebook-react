import { useTranslation } from 'react-i18next';

export type ThemeColor = {
  name: string;
  primary: string;
  nameKey: string;
}

// 应从后端获取主题列表，这里为了方便前端写死
const getThemeColors = (): ThemeColor[] => {
  const { t } = useTranslation();
  
  return [
    {
      name: t('common.themes.defaultBlue'),
      nameKey: 'defaultBlue',
      primary: "#1C64F2"
    },
    {
      name: t('common.themes.vibrantOrange'),
      nameKey: 'vibrantOrange',
      primary: '#ff6b35'
    },
    {
      name: t('common.themes.freshGreen'),
      nameKey: 'freshGreen',
      primary: '#4ade80'
    },
    {
      name: t('common.themes.elegantPurple'),
      nameKey: 'elegantPurple',
      primary: '#a855f7'
    },
    {
      name: t('common.themes.warmRed'),
      nameKey: 'warmRed',
      primary: '#ef4444'
    },
    {
      name: t('common.themes.deepBlue'),
      nameKey: 'deepBlue',
      primary: '#3b82f6'
    }
  ];
};

export default getThemeColors;
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import Toast from '@/components/base/Toast';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const { t } = useTranslation();
  
  // 从store获取状态和actions
  const {
    isLoading,
    user,
    isAuthenticated,
    checkAuth: storeCheckAuth,
    logout: storeLogout,
    updateUser
  } = useAuthStore();

  // 包装checkAuth以添加错误处理和通知
  const checkAuth = useCallback(async () => {
    try {
      const result = await storeCheckAuth();
      return result;
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.authFailed') });
      return false;
    }
  }, [storeCheckAuth]);

  // 包装logout
  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return {
    isLoading,
    user,
    isAuthenticated,
    checkAuth,
    logout,
    updateUser,
  };
};
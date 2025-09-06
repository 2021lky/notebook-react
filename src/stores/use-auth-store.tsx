import { create } from 'zustand';
import { tokenManager } from '@/service/fetch';
import { verifyLogin } from '@/service/login';

// 用户信息类型
export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

// 认证状态接口
interface AuthState {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

// 认证Store接口
interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 创建用户认证Store
export const useAuthStore = create<AuthStore>((set, get) => ({
  // 初始状态
  isLoading: true,
  user: null,
  isAuthenticated: false,

  // Actions
  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
    }
  },

  checkAuth: async () => {
    const { setUser, setLoading } = get();
    setLoading(true);
    
    try {
      const response = await verifyLogin();
      console.log(response)
      const responseData = response as any;
      
      if (responseData?.user) {
        setUser(responseData.data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  },

  logout: () => {
    tokenManager.clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  },
}));

export default useAuthStore;
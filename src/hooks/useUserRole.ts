import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();

  if (!user) {
    return null; 
  }

  return user.role; 
};

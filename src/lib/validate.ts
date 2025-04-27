import { apiRequest } from './api';
export async function isEmailUnique(email: string): Promise<boolean> {
  try {
    const { status } = await apiRequest('/users/check-email', 'POST', { email });


    if (status === 200) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

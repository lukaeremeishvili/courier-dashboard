export interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    role: 'admin' | 'user' | 'courier';
    profile_image?: string;
  }
  
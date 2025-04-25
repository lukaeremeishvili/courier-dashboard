export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: string;
    role: 'admin' | 'user' | 'courier';
    profileImage?: string;
  }
  
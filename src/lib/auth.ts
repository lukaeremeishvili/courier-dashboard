import { User } from '../interfaces/user.interface';


export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const user: User = await response.json();
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};


export const register = async (
    userData: Omit<User, 'id'> & { password: string }
): Promise<User | null> => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const user: User = await response.json();
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};



export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }

        const user: User = await response.json();
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};


export const logout = async (): Promise<void> => {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

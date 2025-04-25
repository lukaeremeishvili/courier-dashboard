import { supabase } from '../lib/supabase';
import { User } from '../interfaces/user.interface';

export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) 
            .single();

        if (error || !data) {
            console.error('Invalid credentials', error);
            return null;
        }

        const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            role: data.role,
            profileImage: data.profile_image,
        };

        return user;
    } catch (error) {
        console.error('Error during login:', error);
        return null;
    }
};

export const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    name: userData.name,
                    phone: userData.phone,
                    role: userData.role,
                    address: userData.address,
                    email: userData.email,
                    password: userData.password,
                    profile_image: userData.profileImage,
                },
            ])
            .select('*');

        if (error) {
            console.error('Error during registration:', error);
            return null;
        }

        const newUser: User = {
            id: data![0].id,
            name: data![0].name,
            email: data![0].email,
            phone: data![0].phone,
            address: data![0].address,
            role: data![0].role,
            profileImage: data![0].profile_image,
        };

        return newUser;
    } catch (error) {
        console.error('Error during registration:', error);
        return null;
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            throw new Error('User not found');
        }

        const userProfileResponse = await supabase
            .from('users')
            .select('*')
            .eq('email', data.user.email)
            .single();

        if (userProfileResponse.error) {
            throw userProfileResponse.error;
        }

        const user: User = {
            id: data.user.id,
            name: userProfileResponse.data!.name,
            email: userProfileResponse.data!.email,
            phone: userProfileResponse.data!.phone,
            address: userProfileResponse.data!.address,
            role: userProfileResponse.data!.role,
            profileImage: userProfileResponse.data!.profile_image,
        };

        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};


import { supabase } from '../lib/supabase';
import { User } from '../interfaces/user.interface';

export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            console.error('Invalid credentials', authError);
            return null;
        }

        const { data: userProfileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return null;
        }

        const user: User = {
            id: userProfileData.id,
            full_name: userProfileData.full_name,
            email: userProfileData.email,
            phone: userProfileData.phone,
            address: userProfileData.address,
            role: userProfileData.role,
            profile_image: userProfileData.profile_image,
        };

        return user;
    } catch (error) {
        console.error('Error during login:', error);
        return null;
    }
};
export const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<User | null> => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });

        if (authError || !authData.user) {
            console.error('Error signing up:', authError);
            return null;
        }

        const { data: userProfileData, error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    full_name: userData.full_name,
                    phone: userData.phone,
                    role: userData.role,
                    address: userData.address,
                    email: userData.email,
                    profile_image: userData.profile_image,
                },
            ])
            .select('*')
            .single();

        if (profileError) {
            console.error('Error inserting user profile:', profileError);
            return null;
        }

        const newUser: User = {
            id: userProfileData.id,
            full_name: userProfileData.full_name,
            email: userProfileData.email,
            phone: userProfileData.phone,
            address: userProfileData.address,
            role: userProfileData.role,
            profile_image: userProfileData.profile_image,
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
            full_name: userProfileResponse.data!.full_name,
            email: userProfileResponse.data!.email,
            phone: userProfileResponse.data!.phone,
            address: userProfileResponse.data!.address,
            role: userProfileResponse.data!.role,
            profile_image: userProfileResponse.data!.profile_image,
        };

        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};


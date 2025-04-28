'use client'

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust path if needed
import { User } from '@/interfaces/user.interface'; // Adjust path if needed

type FilterType = 'all' | 'user' | 'courier';

interface UseAdminUsersDataReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchFilteredData: (filter: FilterType) => Promise<void>; // Expose fetch function if manual refresh is needed
}

export function useAdminUsersData(initialFilter: FilterType): UseAdminUsersDataReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilteredData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .neq('role', 'admin') // Exclude admins
        .limit(10) 
        .order('created_at', { ascending: false });

      // Apply specific role filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('role', filter);
      }

      const { data: usersData, error: usersError } = await query;

      if (usersError) throw usersError;
      setUsers(usersData || []);

    } catch (err: any) {
      console.error('Error fetching admin users data:', err); // Log the specific error
      setError('Failed to load user data.');
      setUsers([]); // Clear users on error
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency array is empty, fetch logic doesn't depend on props/state from outside

  // Initial fetch and fetch on filter change (passed from outside)
  // This effect structure might need adjustment depending on how filter state is managed in the page
  // For now, assuming initial fetch happens based on initialFilter
  useEffect(() => {
    fetchFilteredData(initialFilter);
  }, [initialFilter, fetchFilteredData]); // Re-fetch when initialFilter changes (or hook is first called)

  return { users, loading, error, fetchFilteredData };
} 
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/interfaces/user.interface";

type FilterType = "all" | "user" | "courier";

interface UseAdminUsersDataReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchFilteredData: (filter: FilterType) => Promise<void>;
}

export function useAdminUsersData(
  initialFilter: FilterType
): UseAdminUsersDataReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilteredData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("users")
        .select("*")
        .neq("role", "admin")
        .limit(10)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("role", filter);
      }

      const { data: usersData, error: usersError } = await query;

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (err: any) {
      console.error("Error fetching admin users data:", err);
      setError("Failed to load user data.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchFilteredData(initialFilter);
  }, [initialFilter, fetchFilteredData]);

  return { users, loading, error, fetchFilteredData };
}

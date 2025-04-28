'use client' // Add this because we'll use hooks (useState, useEffect)

import LogoutButton from '@/components/buttons/LogoutBtn'
import React, { useState, useEffect } from 'react' // Import hooks
import { useAuth } from '@/hooks/useAuth' // Corrected path assuming it's in src/hooks
import { supabase } from '@/lib/supabase' // Import supabase client
import { User } from '@/interfaces/user.interface' 
// Task import is removed as tasks are not being fetched/displayed for now

// Import Admin components
import UserTable from './components/UserTable' // Assuming UserTable takes a users prop
import AdminPageClient from './components/AdminPageClient' // Now only for actions
import AdminInfoCard from './components/AdminInfoCard' // Import the new component
import FilterButtons from './components/FilterButtons' // Import the new FilterButtons component
// import CourierList from './components/CourierList' // For later use
// import TaskModal from './components/TaskModal' // For later use

type FilterType = 'all' | 'user' | 'courier'; // Define filter type

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth() 
  const [users, setUsers] = useState<User[]>([])
  // tasks state removed
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all'); // Add state for filter

  // Fetch data when user/auth state changes or filter changes
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchFilteredData(currentFilter) // Fetch data with the current filter
    } else if (!authLoading && user?.role !== 'admin') {
        setError('Unauthorized access.')
        setLoading(false)
    }
    // Dependency array includes currentFilter now
  }, [user, authLoading, currentFilter]) 

  // Modified function to fetch data based on filter
  const fetchFilteredData = async (filter: FilterType) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('users')
        .select('*')
        .neq('role', 'admin') // Add this line to exclude admins always
        .limit(10) // Example: show more users in the table
        .order('created_at', { ascending: false })

      // Apply specific role filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('role', filter);
      }

      const { data: usersData, error: usersError } = await query;

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Removed task fetching logic

    } catch (err: any) {
      console.error('Error fetching admin data:', err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // Callback function to handle filter changes from AdminPageClient
  const handleFilterChange = (newFilter: FilterType) => {
    setCurrentFilter(newFilter); // Update state, which triggers useEffect
  };

  // Render loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Admin Dashboard...</div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  // Render unauthorized state
  if (user?.role !== 'admin') {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div>Unauthorized Access</div>
          </div>
      );
  }

  // Main dashboard content
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4"> 
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* AdminPageClient now only contains actions */} 
        {user && (
          <AdminPageClient 
            // initialFilter={currentFilter} // REMOVED
            user={user} 
            // onFilterChange={handleFilterChange} // REMOVED
          />
        )}
      </header>

      {/* Display Admin Info Card */}
      <AdminInfoCard adminUser={user} /> 

      {/* Main content area */}
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold">User Management</h2> 
             {/* Filter buttons will be rendered below */}
           </div>
           {/* Render Filter Buttons here */}
           <FilterButtons 
              initialFilter={currentFilter} 
              onFilterChange={handleFilterChange} 
            />
           <UserTable users={users} /> 
        </section>

        {/* Other sections placeholder */}
      </div>
    </div>
  )
}

export default AdminDashboardPage
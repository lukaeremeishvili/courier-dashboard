'use client' // Add this because we'll use hooks (useState, useEffect)

import LogoutButton from '@/components/buttons/LogoutBtn'
import React, { useState, useEffect } from 'react' // Import hooks
import { useAuth } from '@/hooks/useAuth' // Corrected path assuming it's in src/hooks
import { supabase } from '@/lib/supabase' // Import supabase client
import { User } from '@/interfaces/user.interface' 
// Task import is removed as tasks are not being fetched/displayed for now

// Import Admin components
import UserTable from './components/UserTable' // Assuming UserTable takes a users prop
// import CourierList from './components/CourierList' // For later use
// import TaskModal from './components/TaskModal' // For later use

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth() 
  const [users, setUsers] = useState<User[]>([])
  // tasks state removed
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchInitialData()
    } else if (!authLoading && user?.role !== 'admin') {
        setError('Unauthorized access.')
        setLoading(false)
    }
  }, [user, authLoading])

  const fetchInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch first 10 users (example, increased limit)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(10) // Example: show more users in the table
        .order('created_at', { ascending: false })

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
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </header>

      {/* Main content area - can use grid or flex */}
      <div className="space-y-8">
        {/* Users Section - Now using UserTable component */}
        <section className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold">User Management</h2>
             {/* Add button for navigating to full user list or adding user later */}
             {/* <Link href="/dashboard/admin/users" className="text-indigo-600 hover:underline">View All</Link> */}
          </div>
          <UserTable users={users} /> 
        </section>

        {/* Removed Tasks Section */}

        {/* Placeholder for other sections like Courier Management, Task Assignment etc. */}
         {/* 
         <section className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4">Courier Management</h2>
           <CourierList couriers={users.filter(u => u.role === 'courier')} /> 
         </section>

         <section className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4">Assign Task</h2>
           <button>Assign New Task</button> // This would open TaskModal
         </section>
         */}
      </div>
    </div>
  )
}

export default AdminDashboardPage
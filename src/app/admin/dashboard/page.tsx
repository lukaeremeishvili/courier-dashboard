'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, UserRole } from '@/types'
import { supabase } from '@/lib/supabase'
import AssignTaskModal from '@/components/AssignTaskModal'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<UserRole | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [filter, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      if (filter !== 'all') {
        query = query.eq('role', filter)
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      fetchUsers()
    } catch (err) {
      setError('Failed to delete user')
      console.error(err)
    }
  }

  const handleAssignTask = (courierId: string) => {
    setSelectedCourierId(courierId)
    setIsModalOpen(true)
  }

  const handleTaskAssigned = () => {
    fetchUsers()
  }

  if (!user || user.role !== 'admin') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={signOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setFilter('courier')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'courier'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                Couriers
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                        <p className="text-sm text-gray-500">
                          Role: {user.role}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        {user.role === 'courier' && (
                          <button
                            onClick={() => handleAssignTask(user.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Assign Task
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </nav>
            </div>
          )}
        </div>
      </main>

      <AssignTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCourierId(null)
        }}
        courierId={selectedCourierId || ''}
        onTaskAssigned={handleTaskAssigned}
      />
    </div>
  )
} 
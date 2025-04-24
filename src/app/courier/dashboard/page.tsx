'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TimeSlot, Task } from '@/types'
import { supabase } from '@/lib/supabase'

export default function CourierDashboard() {
  const { user, signOut } = useAuth()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTimeSlot, setNewTimeSlot] = useState({
    day_of_week: 0,
    start_time: '',
    end_time: '',
  })

  useEffect(() => {
    if (user) {
      fetchTimeSlots()
      fetchTasks()
    }
  }, [user])

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('courier_id', user?.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setTimeSlots(data || [])
    } catch (err) {
      setError('Failed to fetch time slots')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('courier_id', user?.id)
        .order('due_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError('Failed to fetch tasks')
      console.error(err)
    }
  }

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('time_slots').insert([
        {
          courier_id: user?.id,
          ...newTimeSlot,
          is_booked: false,
        },
      ])

      if (error) throw error

      setNewTimeSlot({
        day_of_week: 0,
        start_time: '',
        end_time: '',
      })
      fetchTimeSlots()
    } catch (err) {
      setError('Failed to add time slot')
      console.error(err)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (err) {
      setError('Failed to update task status')
      console.error(err)
    }
  }

  if (!user || user.role !== 'courier') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Courier Dashboard</h1>
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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Slots Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Available Time Slots
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleAddTimeSlot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Day of Week
                    </label>
                    <select
                      value={newTimeSlot.day_of_week}
                      onChange={(e) =>
                        setNewTimeSlot({
                          ...newTimeSlot,
                          day_of_week: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newTimeSlot.start_time}
                      onChange={(e) =>
                        setNewTimeSlot({
                          ...newTimeSlot,
                          start_time: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newTimeSlot.end_time}
                      onChange={(e) =>
                        setNewTimeSlot({
                          ...newTimeSlot,
                          end_time: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Time Slot
                  </button>
                </form>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {timeSlots.map((slot) => (
                    <li key={slot.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                              slot.day_of_week
                            ]}
                          </p>
                          <p className="text-sm text-gray-500">
                            {slot.start_time} - {slot.end_time}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: {slot.is_booked ? 'Booked' : 'Available'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Tasks
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <li key={task.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {task.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Priority: {task.priority}
                          </p>
                        </div>
                        <div>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateTaskStatus(
                                task.id,
                                e.target.value as Task['status']
                              )
                            }
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
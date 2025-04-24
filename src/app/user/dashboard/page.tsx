'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TimeSlot, Booking } from '@/types'
import { supabase } from '@/lib/supabase'

export default function UserDashboard() {
  const { user, signOut } = useAuth()
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchAvailableTimeSlots()
      fetchBookings()
    }
  }, [user, selectedDay])

  const fetchAvailableTimeSlots = async () => {
    try {
      let query = supabase
        .from('time_slots')
        .select('*, couriers(full_name, phone)')
        .eq('is_booked', false)

      if (selectedDay !== null) {
        query = query.eq('day_of_week', selectedDay)
      }

      const { data, error } = await query.order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setAvailableTimeSlots(data || [])
    } catch (err) {
      setError('Failed to fetch available time slots')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, time_slots(*, couriers(full_name, phone))')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      setError('Failed to fetch bookings')
      console.error(err)
    }
  }

  const handleBookTimeSlot = async (timeSlotId: string) => {
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          user_id: user?.id,
          time_slot_id: timeSlotId,
        },
      ])

      if (error) throw error

      // Update the time slot as booked
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({ is_booked: true })
        .eq('id', timeSlotId)

      if (updateError) throw updateError

      fetchAvailableTimeSlots()
      fetchBookings()
    } catch (err) {
      setError('Failed to book time slot')
      console.error(err)
    }
  }

  const handleCancelBooking = async (bookingId: string, timeSlotId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      // Update the time slot as available
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({ is_booked: false })
        .eq('id', timeSlotId)

      if (updateError) throw updateError

      fetchAvailableTimeSlots()
      fetchBookings()
    } catch (err) {
      setError('Failed to cancel booking')
      console.error(err)
    }
  }

  if (!user || user.role !== 'user') {
    return <div>Unauthorized</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">User Dashboard</h1>
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
            {/* Available Time Slots Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Available Time Slots
                </h3>
                <div className="mt-4">
                  <select
                    value={selectedDay === null ? '' : selectedDay}
                    onChange={(e) =>
                      setSelectedDay(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Days</option>
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {availableTimeSlots.map((slot) => (
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
                            Courier: {slot.couriers?.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {slot.couriers?.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBookTimeSlot(slot.id)}
                          className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Book
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Bookings
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    booking.time_slots && (
                      <li key={booking.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                                booking.time_slots.day_of_week
                              ]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.time_slots.start_time} - {booking.time_slots.end_time}
                            </p>
                            <p className="text-sm text-gray-500">
                              Courier: {booking.time_slots.couriers?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Phone: {booking.time_slots.couriers?.phone}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.time_slot_id)}
                            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                    )
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
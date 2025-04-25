'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TimeSlot, Booking } from '@/types'
import { supabase } from '@/lib/supabase'
// Import useRouter if you want to redirect unauthorized users
// import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  // Get loading state from context as well
  const { user, signOut, loading: authLoading } = useAuth()
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  // Combine auth loading with dashboard-specific loading
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  // const router = useRouter(); // Uncomment if redirecting

  useEffect(() => {
    setError(''); // Clear errors on user/day change
    if (user) {
      // Reset dashboard loading when user is available
      setDashboardLoading(true);
      console.log("User detected, fetching dashboard data...");
      Promise.all([fetchAvailableTimeSlots(), fetchBookings()])
        .catch((err) => {
             console.error("Error fetching dashboard data:", err);
             // Keep error state set by individual functions
        })
        .finally(() => {
           console.log("Dashboard data fetching complete.");
           setDashboardLoading(false);
        });
    } else if (!authLoading) {
      // If auth is not loading and there's no user, stop dashboard loading
      console.log("Auth loading finished, no user found.");
      setDashboardLoading(false);
      // Uncomment to redirect if no user after auth loading finishes
      // router.push('/login');
    }
    // Depend on user and selectedDay for refetching data
  }, [user, selectedDay, authLoading]) // Add authLoading dependency

  const fetchAvailableTimeSlots = async (): Promise<void> => {
    console.log("Fetching available time slots...");
    try {
      let query = supabase
        .from('time_slots')
        // Restore nested select for couriers
        .select('*, couriers(full_name, phone)')
        .eq('is_booked', false)

      if (selectedDay !== null) {
        console.log(`Filtering time slots by day: ${selectedDay}`);
        query = query.eq('day_of_week', selectedDay)
      } else {
         console.log("Fetching time slots for all days.");
      }

      const { data, error: queryError } = await query.order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (queryError) throw queryError
      console.log(`Fetched ${data?.length || 0} available time slots.`);
      setAvailableTimeSlots(data || [])
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError('Failed to fetch available time slots')
      setAvailableTimeSlots([]) // Clear on error
      // Re-throw error if you want Promise.all to catch it explicitly
      // throw err;
    }
  }

  const fetchBookings = async (): Promise<void> => {
    console.log("Fetching bookings...");
    try {
       if (!user?.id) {
           console.log("fetchBookings skipped: user ID not available yet.");
           setBookings([])
           return;
       }
       console.log(`Fetching bookings for user ID: ${user.id}`);
       const { data, error: queryError } = await supabase
         .from('bookings')
         // Restore nested select for time_slots and couriers
         .select('*, time_slots(*, couriers(full_name, phone))')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false })

       if (queryError) throw queryError
       console.log(`Fetched ${data?.length || 0} bookings.`);
       setBookings(data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings')
      setBookings([]) // Clear on error
      // Re-throw error if you want Promise.all to catch it explicitly
      // throw err;
    }
  }

  const handleBookTimeSlot = async (timeSlotId: string) => {
    if (!user?.id) {
        setError("Cannot book: User not logged in.");
        return;
    }
    console.log(`Attempting to book time slot: ${timeSlotId} for user: ${user.id}`);
    setError(''); // Clear previous errors
    try {
      const { error: insertError } = await supabase.from('bookings').insert([
        {
          user_id: user.id, // Use user.id directly
          time_slot_id: timeSlotId,
        },
      ])

      if (insertError) throw insertError
      console.log("Booking successful, updating time slot status...");

      // Update the time slot as booked
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({ is_booked: true })
        .eq('id', timeSlotId)

      if (updateError) throw updateError
      console.log("Time slot status updated. Refreshing data...");

      // Refresh data
      setDashboardLoading(true);
      Promise.all([fetchAvailableTimeSlots(), fetchBookings()]).finally(() => setDashboardLoading(false));
    } catch (err) {
      console.error('Failed to book time slot:', err);
      setError('Failed to book time slot')
    }
  }

  const handleCancelBooking = async (bookingId: string, timeSlotId: string) => {
     console.log(`Attempting to cancel booking: ${bookingId} (time slot: ${timeSlotId})`);
     setError(''); // Clear previous errors
    try {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (deleteError) throw deleteError
      console.log("Booking cancelled, updating time slot status...");

      // Update the time slot as available
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({ is_booked: false })
        .eq('id', timeSlotId)

      if (updateError) throw updateError
      console.log("Time slot status updated. Refreshing data...");

      // Refresh data
      setDashboardLoading(true);
      Promise.all([fetchAvailableTimeSlots(), fetchBookings()]).finally(() => setDashboardLoading(false));
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking')
    }
  }

  // Show loading indicator while auth context is loading OR dashboard data is loading
  if (authLoading || dashboardLoading) {
     console.log(`Dashboard loading state: authLoading=${authLoading}, dashboardLoading=${dashboardLoading}`);
     return (
        <div className="min-h-screen flex items-center justify-center">
             <div>Loading dashboard...</div>
        </div>
     );
  }

  // Check for user *after* loading states are false
  if (!user || user.role !== 'user') {
    console.log("Unauthorized access attempt or user role mismatch.");
    // Optionally redirect to login if preferred
    // useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [authLoading, user, router]);
    return (
       <div className="min-h-screen flex items-center justify-center">
         <div>Unauthorized. You might need to log in or have the correct role.</div>
         {/* Optionally add a button to go to login */}
         {/* <button onClick={() => router.push('/login')}>Go to Login</button> */}
       </div>
    )
  }

  // --- Render actual dashboard content below ---
  console.log("Rendering user dashboard content.");
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
              {/* Display user email or name if available */}
              {user.email && <span className="mr-4 text-sm text-gray-600">{user.email}</span>}
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
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
                  <label htmlFor="day-select" className="sr-only">Filter by day</label>
                  <select
                    id="day-select"
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
              <div className="border-t border-gray-200 h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {availableTimeSlots.length === 0 && <li className="px-4 py-4 text-sm text-gray-500">No available slots found for the selected day.</li>}
                  {availableTimeSlots.map((slot) => (
                    <li key={slot.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                              slot.day_of_week
                            ]}
                          </p>
                          <p className="text-sm text-gray-900">
                            {slot.start_time} - {slot.end_time}
                          </p>
                          <p className="text-sm text-gray-500">
                            Courier: {slot.couriers?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {slot.couriers?.phone || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBookTimeSlot(slot.id)}
                          disabled={dashboardLoading} // Disable button while loading
                          className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="border-t border-gray-200 h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {bookings.length === 0 && <li className="px-4 py-4 text-sm text-gray-500">You have no bookings.</li>}
                  {bookings.map((booking) => (
                    // Ensure time_slots is available before rendering
                    booking.time_slots ? ( // Re-enable check
                      <li key={booking.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            {/* Restore detailed booking info */}
                            <p className="text-sm font-medium text-indigo-600">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                                booking.time_slots.day_of_week
                              ]}
                            </p>
                            <p className="text-sm text-gray-900">
                              {booking.time_slots.start_time} - {booking.time_slots.end_time}
                            </p>
                            <p className="text-sm text-gray-500">
                              Courier: {booking.time_slots.couriers?.full_name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Phone: {booking.time_slots.couriers?.phone || 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.time_slot_id)}
                            disabled={dashboardLoading}
                            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                    ) : (
                       <li key={booking.id} className="px-4 py-4 text-sm text-red-500">Booking data incomplete (missing time slot info).</li>
                    )
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
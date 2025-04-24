export type UserRole = 'user' | 'courier' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
  created_at: string
}

export interface Courier extends User {
  is_available: boolean
}

export interface TimeSlot {
  id: string
  courier_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string // HH:mm format
  end_time: string // HH:mm format
  is_booked: boolean
  couriers?: {
    full_name: string
    phone: string
  }
}

export interface Booking {
  id: string
  user_id: string
  courier_id: string
  time_slot_id: string
  created_at: string
  time_slots?: {
    day_of_week: number
    start_time: string
    end_time: string
    couriers?: {
      full_name: string
      phone: string
    }
  }
}

export interface Task {
  id: string
  courier_id: string
  title: string
  description: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
} 
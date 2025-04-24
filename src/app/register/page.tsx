'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string) => {
    // More strict email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!re.test(email)) {
      return false
    }
    
    // Check for common email providers
    const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const domain = email.split('@')[1]
    return allowedDomains.includes(domain)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as UserRole

    if (!validateEmail(email)) {
      setError('გთხოვთ გამოიყენოთ მხოლოდ Gmail, Yahoo, Hotmail ან Outlook ელ.ფოსტა')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password, fullName, phone, role)
      console.log('Registration result:', result)
      
      if (result?.user?.identities?.length === 0) {
        setError('ეს ელ.ფოსტა უკვე გამოყენებულია')
        return
      }
      
      router.push('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.message.includes('Email address')) {
        setError('ელ.ფოსტის მისამართი არასწორია ან უკვე გამოყენებულია')
      } else if (error.message.includes('password')) {
        setError('პაროლი არ აკმაყოფილებს მოთხოვნებს')
      } else {
        setError('რეგისტრაციის დროს დაფიქსირდა შეცდომა: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            შექმენით ანგარიში
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                ელ.ფოსტა
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ელ.ფოსტა (მხოლოდ Gmail, Yahoo, Hotmail, Outlook)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                პაროლი
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="პაროლი (მინიმუმ 6 სიმბოლო)"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="sr-only">
                სრული სახელი
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="სრული სახელი"
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                ტელეფონის ნომერი
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ტელეფონის ნომერი"
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                როლი
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">აირჩიეთ როლი</option>
                <option value="user">მომხმარებელი</option>
                <option value="courier">კურიერი</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              უკვე გაქვთ ანგარიში? შესვლა
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 
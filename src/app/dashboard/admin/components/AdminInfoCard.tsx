'use client'; // This component likely doesn't need client hooks unless interactivity is added

import React from 'react';
import { User } from '@/interfaces/user.interface'; // Adjust path if needed
import Image from 'next/image'; // Import Image component for optimization

interface AdminInfoCardProps {
  adminUser: User | null; // Accept the admin user object (can be null initially)
}

const AdminInfoCard: React.FC<AdminInfoCardProps> = ({ adminUser }) => {
  if (!adminUser) {
    return null; // Don't render anything if user data is not available yet
  }

  // Default image or placeholder if profile_image is null/empty
  const profileImageUrl = adminUser.profile_image || '/default-avatar.png'; // Replace with your placeholder image path

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg mb-8"> {/* White bg, larger shadow */}
      <div className="flex items-center mb-4">
         {/* Simple User Icon Placeholder */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-800">Admin Information</h2> {/* Slightly larger title */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Grid layout */}
        {/* Profile Image Section */}
        <div className="flex justify-center md:justify-start">
          <Image 
            src={profileImageUrl}
            alt="Profile Picture"
            width={100} // Specify width
            height={100} // Specify height
            className="rounded-full object-cover border-2 border-indigo-200"
            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} // Fallback for broken image
            priority
          />
        </div>
        
        {/* Details Section */}
        <div className="md:col-span-2 space-y-3"> {/* Span 2 columns on medium screens and up */}
          <div className="grid grid-cols-3 gap-x-2">
            <span className="font-medium text-gray-600 col-span-1">Full Name:</span>
            <span className="text-gray-900 col-span-2">{adminUser.full_name}</span>
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            <span className="font-medium text-gray-600 col-span-1">Email:</span>
            <span className="text-gray-900 col-span-2 break-all">{adminUser.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            <span className="font-medium text-gray-600 col-span-1">Phone:</span>
            <span className="text-gray-900 col-span-2">{adminUser.phone || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            <span className="font-medium text-gray-600 col-span-1">Address:</span>
            <span className="text-gray-900 col-span-2">{adminUser.address || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-3 gap-x-2 items-center">
            <span className="font-medium text-gray-600 col-span-1">Role:</span>
            <span className="col-span-2">
              <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                {adminUser.role}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminInfoCard; 
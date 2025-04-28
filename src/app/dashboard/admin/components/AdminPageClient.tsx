'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // To handle filter navigation
import LogoutButton from '@/components/buttons/LogoutBtn'
// We might not need useAuth here anymore if handleLogout moves
// import { useAuth } from '@/hooks/useAuth' // Adjust path if needed
import { User } from '@/interfaces/user.interface' // Adjust path if needed

// Remove filter-related props
interface AdminPageClientProps {
  // initialFilter: 'all' | 'user' | 'courier'; // REMOVED
  user: User; // Pass the user object for delete logic confirmation/display
  // onFilterChange: (newFilter: 'all' | 'user' | 'courier') => void; // REMOVED
}

const AdminPageClient: React.FC<AdminPageClientProps> = ({ 
  // initialFilter, // REMOVED
  user, 
  // onFilterChange // REMOVED
}) => {
  const router = useRouter();
  // Remove useAuth if handleLogout is not needed here anymore, or keep if needed
  // const { handleLogout } = useAuth(); 
  // Remove filter state and handler
  // const [filter, setFilter] = useState<'all' | 'user' | 'courier'>(initialFilter);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null); // Specific error state for delete

  // Remove filter button handler
  /*
  const handleFilterButtonClick = (newFilter: 'all' | 'user' | 'courier') => {
    setFilter(newFilter); 
    onFilterChange(newFilter); 
  };
  */

  // Self-deletion logic (moved from the server component)
  const handleDeleteSelf = async () => {
    if (!user) return; 

    const confirmation = window.confirm(
        `Are you absolutely sure you want to delete your own admin account (${user.email})? This action cannot be undone.`
    );

    if (confirmation) {
        setDeleteLoading(true);
        setDeleteError(null); 
        try {
            const response = await fetch('/api/admin/delete-self', { // Assumes API route exists
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            alert('Account deleted successfully. Signing out.');
            // Consider how logout is handled now - maybe redirect to /logout API route?
            // Or trigger a logout from context if useAuth is kept.
             router.push('/login'); // Simple redirect for now

        } catch (err: any) {
            console.error("Failed to delete account:", err);
            setDeleteError(err.message || 'Failed to delete account. Please try again.');
            setDeleteLoading(false); 
            alert(`Error deleting account: ${err.message}`);
        }
    }
  };

  // Return only the Actions Container
  return (
    <div className="flex items-center space-x-4">
      {deleteError && <span className="text-red-600 text-sm">Error: {deleteError}</span>}
      <button
          onClick={handleDeleteSelf}
          disabled={deleteLoading} 
          className={`px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteLoading ? 'animate-pulse' : ''
          }`}
      >
          {deleteLoading ? 'Deleting...' : 'Delete My Account'}
      </button>
      <LogoutButton /> {/* Keep LogoutButton here */}
    </div>
  );
}

export default AdminPageClient; 
'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/buttons/LogoutBtn";
import { User } from "@/interfaces/user.interface";
import { useAuth } from "@/hooks/useAuth";

interface AdminPageClientProps {
  user: User;
}

const AdminPageClient: React.FC<AdminPageClientProps> = ({ user }) => {
  const router = useRouter();
  const { handleLogout } = useAuth();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteSelf = async () => {
    if (!user) return;

    const confirmation = window.confirm(
      `Are you absolutely sure you want to delete your own admin account (${user.email})? This action cannot be undone.`
    );

    if (confirmation) {
      setDeleteLoading(true);
      setDeleteError(null);
      try {
        const response = await fetch("/api/admin/delete-self", {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        
        handleLogout();
        
        alert("Account deleted successfully. Signing out.");

        router.push("/login");
      } catch (err: any) {
        console.error("Failed to delete account:", err);
        setDeleteError(
          err.message || "Failed to delete account. Please try again."
        );
        setDeleteLoading(false);
        alert(`Error deleting account: ${err.message}`);
      }
    }
  };
  

  return (
    <div className="flex items-center space-x-4">
      {deleteError && (
        <span className="text-red-600 text-sm">Error: {deleteError}</span>
      )}
      <button
        onClick={handleDeleteSelf}
        disabled={deleteLoading}
        className={`px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed ${
          deleteLoading ? "animate-pulse" : ""
        }`}
      >
        {deleteLoading ? "Deleting..." : "Delete My Account"}
      </button>
      <LogoutButton />
    </div>
  );
};

export default AdminPageClient;

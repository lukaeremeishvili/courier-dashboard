"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import UserTable from "./components/UserTable";
import AdminPageClient from "./components/AdminPageClient";
import AdminInfoCard from "./components/AdminInfoCard";
import FilterButtons from "./components/FilterButtons";
import { useAdminUsersData } from "./useAdminUsersData";

type FilterType = "all" | "user" | "courier";

const AdminDashboardPage = () => {
  const { user: adminUser, loading: authLoading, error: authError } = useAuth();

  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchFilteredData,
  } = useAdminUsersData(currentFilter);

  const handleFilterChange = (newFilter: FilterType) => {
    setCurrentFilter(newFilter);
    fetchFilteredData(newFilter);
  };

  const isLoading = authLoading || usersLoading;
  const displayError = authError || usersError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Admin Dashboard...</div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {displayError}</div>
      </div>
    );
  }

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Unauthorized Access</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {adminUser && <AdminPageClient user={adminUser} />}
      </header>

      <AdminInfoCard adminUser={adminUser} />

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          <FilterButtons
            initialFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
          <UserTable users={users} />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

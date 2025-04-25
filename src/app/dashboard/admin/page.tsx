"use client";
import UserTable from "./components/UserTable";
import CourierList from "./components/CourierList";
import TaskModal from "./components/TaskModal";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <UserTable />
      <CourierList />
      <TaskModal />
    </div>
  );
}

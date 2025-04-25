"use client";
import ProfileForm from "./components/ProfileForm";

export default function UserDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      <ProfileForm />
    </div>
  );
}

import ProfileForm from "./components/ProfileForm";
import TaskList from "./components/TaskList";
import TimeSlots from "./components/TimeSlots";

export default async function CourierDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Courier Dashboard</h1>
      <ProfileForm />
      <TaskList />
      <TimeSlots />
    </div>
  );
}

import { supabase } from "@/lib/supabase";

async function getTasks() {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", "courier_id"); // შეცვალე საჭირო ID-თ

  return data;
}

export default async function TaskList() {
  const tasks = await getTasks();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Assigned Tasks</h2>
      <ul className="list-disc pl-5">
        {tasks?.map((task: any) => (
          <li key={task.id}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

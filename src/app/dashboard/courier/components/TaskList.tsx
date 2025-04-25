"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", "courier_id"); // შეცვალე საჭირო ID-თ

      if (data) setTasks(data);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Assigned Tasks</h2>
      <ul className="list-disc pl-5">
        {tasks.map((task: any) => (
          <li key={task.id}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

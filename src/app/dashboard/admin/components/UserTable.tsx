import { supabase } from "@/lib/supabase";

async function getUsers() {
  const { data, error } = await supabase.from("profiles").select("*");
  return data;
}

export default async function UserTable() {
  const users = await getUsers();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">All Users</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Phone</th>
            <th className="border px-3 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id}>
              <td className="border px-3 py-1">{u.name}</td>
              <td className="border px-3 py-1">{u.phone}</td>
              <td className="border px-3 py-1">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

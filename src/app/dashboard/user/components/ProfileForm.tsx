import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfileForm() {
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "user")
        .single();

      if (data) setUser(data);
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">User Profile</h2>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
}

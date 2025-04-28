import { supabase } from "@/lib/supabase";

async function getProfile() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "courier")
    .single();
  return data;
}

export default async function ProfileForm() {
  const profile = await getProfile();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
      <p>
        <strong>Name:</strong> {profile?.name}
      </p>
      <p>
        <strong>Phone:</strong> {profile?.phone}
      </p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfileForm() {
  const [profile, setProfile] = useState({ name: "", phone: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "courier")
        .single();

      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
      <p>
        <strong>Name:</strong> {profile.name}
      </p>
      <p>
        <strong>Phone:</strong> {profile.phone}
      </p>
    </div>
  );
}

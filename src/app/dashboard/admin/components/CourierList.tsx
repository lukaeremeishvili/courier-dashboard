"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CourierList() {
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    const fetchCouriers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "courier");

      if (data) setCouriers(data);
    };
    fetchCouriers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Couriers</h2>
      <ul className="list-disc pl-5">
        {couriers.map((courier: any) => (
          <li key={courier.id}>
            {courier.name} ({courier.phone})
          </li>
        ))}
      </ul>
    </div>
  );
}

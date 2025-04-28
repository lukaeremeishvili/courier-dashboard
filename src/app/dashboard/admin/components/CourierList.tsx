import { supabase } from "@/lib/supabase";

async function getCouriers() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "courier");

  return data;
}

export default async function CourierList() {
  const couriers = await getCouriers();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Couriers</h2>
      <ul className="list-disc pl-5">
        {couriers?.map((courier: any) => (
          <li key={courier.id}>
            {courier.name} ({courier.phone})
          </li>
        ))}
      </ul>
    </div>
  );
}

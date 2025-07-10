"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

const PLANS = [
  { name: "Monthly", price: 20, duration: "1 month" },
  { name: "Quarterly", price: 55, duration: "3 months" },
  { name: "Half-Yearly", price: 100, duration: "6 months" },
  { name: "Yearly", price: 180, duration: "12 months" },
];

export default function SubscriptionPlans() {
  const { user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (planName: string) => {
    setSelected(planName);
    setMessage(null);
    setError(null);
    if (!user) {
      setError("You must be signed in to subscribe.");
      return;
    }
    const { data: existing, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan", planName)
      .eq("status", "pending");
    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    if (existing && existing.length > 0) {
      setMessage("You already have a pending subscription for this plan.");
      return;
    }
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, plan: planName, status: "pending" });
    if (insertError) setError(insertError.message);
    else setMessage("Subscription request saved! Proceed to payment.");
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Choose a Subscription Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded p-4 cursor-pointer transition-all ${selected === plan.name ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"}`}
            onClick={() => handleSelect(plan.name)}
          >
            <div className="text-lg font-bold">{plan.name}</div>
            <div className="text-2xl font-semibold mb-2">${plan.price}</div>
            <div className="text-gray-500">{plan.duration}</div>
            {selected === plan.name && <div className="text-blue-600 mt-2">Selected</div>}
          </div>
        ))}
      </div>
      {message && <div className="text-green-600 mt-4">{message}</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
} 
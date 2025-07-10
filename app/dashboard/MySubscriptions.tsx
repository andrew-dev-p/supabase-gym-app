"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export default function MySubscriptions() {
  const { user } = useUser();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("subscriptions")
      .select("id, plan, status, start_date, end_date")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setSubs(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;
  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
      {subs.length === 0 ? (
        <div>No subscriptions found.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Plan</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Start Date</th>
              <th className="border px-2 py-1">End Date</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id} className={sub.status === "active" ? "bg-green-50" : ""}>
                <td className="border px-2 py-1">{sub.plan}</td>
                <td className="border px-2 py-1 capitalize">{sub.status}</td>
                <td className="border px-2 py-1">{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "-"}</td>
                <td className="border px-2 py-1">{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 
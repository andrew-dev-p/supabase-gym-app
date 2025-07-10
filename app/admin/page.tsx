"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setIsAdmin(false);
        else setIsAdmin(data.role === "admin");
      });
  }, [user]);

  useEffect(() => {
    if (isAdmin !== true) return;
    setLoading(true);
    supabase
      .from("subscriptions")
      .select("id, user_id, plan, status, start_date, end_date")
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setSubs(data || []);
        setLoading(false);
      });
  }, [isAdmin]);

  if (isAdmin === null) return <div>Checking admin access...</div>;
  if (isAdmin === false) return <div className="text-red-500">Access denied. Admins only.</div>;

  if (loading) return <div>Loading all subscriptions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Admin: All User Subscriptions</h1>
      {subs.length === 0 ? (
        <div>No subscriptions found.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Plan</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Start Date</th>
              <th className="border px-2 py-1">End Date</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id} className={sub.status === "active" ? "bg-green-50" : ""}>
                <td className="border px-2 py-1 font-mono">{sub.user_id}</td>
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
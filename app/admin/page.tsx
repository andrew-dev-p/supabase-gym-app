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
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const handleAdminCancel = async (userId: string, plan: string) => {
    setCancelLoading(userId + plan);
    setError(null);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setLoading(true);
        supabase
          .from("subscriptions")
          .select("id, user_id, plan, status, start_date, end_date, profiles(full_name, email)")
          .order("start_date", { ascending: false })
          .then(({ data, error }) => {
            if (error) setError(error.message);
            else {
              const fixed: Subscription[] = (data || []).map((sub: unknown) => {
                if (
                  typeof sub === "object" &&
                  sub !== null &&
                  "profiles" in sub &&
                  Array.isArray((sub as { profiles: unknown }).profiles)
                ) {
                  return {
                    ...(sub as object),
                    profiles: (sub as { profiles: unknown[] }).profiles[0] as { full_name: string | null; email: string | null },
                  } as Subscription;
                }
                return sub as Subscription;
              });
              setSubs(fixed);
            }
            setLoading(false);
          });
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Failed to cancel subscription.");
      }
    }
    setCancelLoading(null);
  };

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
      .select("id, user_id, plan, status, start_date, end_date, profiles(full_name, email)")
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else {
          const fixed: Subscription[] = (data || []).map((sub: unknown) => {
            if (
              typeof sub === "object" &&
              sub !== null &&
              "profiles" in sub &&
              Array.isArray((sub as { profiles: unknown }).profiles)
            ) {
              return {
                ...(sub as object),
                profiles: (sub as { profiles: unknown[] }).profiles[0] as { full_name: string | null; email: string | null },
              } as Subscription;
            }
            return sub as Subscription;
          });
          setSubs(fixed);
        }
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
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
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
                <td className="border px-2 py-1">{sub.profiles?.full_name || "-"}</td>
                <td className="border px-2 py-1">{sub.profiles?.email || "-"}</td>
                <td className="border px-2 py-1">{sub.plan}</td>
                <td className="border px-2 py-1 capitalize">{sub.status}
                  {sub.status === "active" && (
                    <button
                      className="ml-2 text-xs text-red-600 underline"
                      disabled={!!cancelLoading}
                      onClick={() => handleAdminCancel(sub.user_id, sub.plan)}
                    >
                      {cancelLoading === sub.user_id + sub.plan ? "Canceling..." : "Cancel"}
                    </button>
                  )}
                </td>
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
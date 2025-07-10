"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import Charts from "./Charts";

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
  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const totalSubs = subs.length;
  const activeSubs = subs.filter((s) => s.status === "active").length;
  const estimatedRevenue = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      if (s.plan === "Monthly") return sum + 20;
      if (s.plan === "Quarterly") return sum + 55;
      if (s.plan === "Half-Yearly") return sum + 100;
      if (s.plan === "Yearly") return sum + 180;
      return sum;
    }, 0);

  const filteredSubs = subs.filter((sub) => {
    if (planFilter && sub.plan !== planFilter) return false;
    if (statusFilter && sub.status !== statusFilter) return false;
    if (
      search &&
      !(
        sub.user_id.includes(search) ||
        (sub.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (sub.profiles?.email || "").toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

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

  function exportCSV() {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Plan",
      "Status",
      "Start Date",
      "End Date",
    ];
    const rows = filteredSubs.map((sub) => [
      sub.user_id,
      sub.profiles?.full_name || "",
      sub.profiles?.email || "",
      sub.plan,
      sub.status,
      sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "",
      sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
      <Charts subs={subs} />
      <div className="mb-6 flex flex-wrap gap-6 items-end">
        <div>
          <div className="font-semibold">Total Subs</div>
          <div>{totalSubs}</div>
        </div>
        <div>
          <div className="font-semibold">Active Subs</div>
          <div>{activeSubs}</div>
        </div>
        <div>
          <div className="font-semibold">Est. Revenue</div>
          <div>${estimatedRevenue}</div>
        </div>
        <div>
          <button onClick={exportCSV} className="btn btn-secondary mt-5">Export CSV</button>
        </div>
        <div>
          <label className="block text-xs font-medium">Plan</label>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="input input-bordered">
            <option value="">All</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input input-bordered">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium">Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-bordered"
            placeholder="User ID, name, or email"
          />
        </div>
      </div>
      {filteredSubs.length === 0 ? (
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
            {filteredSubs.map((sub) => (
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
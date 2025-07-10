"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

interface ChartProps {
  subs: {
    plan: string;
    status: string;
    start_date: string | null;
  }[];
}

export default function Charts({ subs }: ChartProps) {
  const plans = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];
  const activeByPlan = plans.map((plan) => ({
    plan,
    count: subs.filter((s) => s.plan === plan && s.status === "active").length,
  }));

  const monthCounts: Record<string, number> = {};
  subs.forEach((s) => {
    if (!s.start_date) return;
    const month = new Date(s.start_date).toLocaleString("default", { year: "numeric", month: "short" });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const lineData = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 mb-8">
      <div className="flex-1 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Active Subscriptions by Plan</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={activeByPlan}>
            <XAxis dataKey="plan" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">New Subscriptions per Month</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
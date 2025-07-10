"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const handleCancel = async (plan: string) => {
    if (!user) return;
    setCancelLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setSubs((subs) =>
          subs.map((sub) =>
            sub.plan === plan && sub.status === "active"
              ? { ...sub, status: "canceled", end_date: new Date().toISOString() }
              : sub
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription.");
    }
    setCancelLoading(null);
  };

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

  return (
    <Card className="mt-8">
      <CardContent className="py-6">
        <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
        {loading && <div>Loading subscriptions...</div>}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && (
          subs.length === 0 ? (
            <div>No subscriptions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((sub) => (
                  <TableRow key={sub.id} className={sub.status === "active" ? "bg-green-50" : ""}>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      {sub.status}
                      {sub.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2 text-xs"
                          disabled={!!cancelLoading}
                          onClick={() => handleCancel(sub.plan)}
                        >
                          {cancelLoading === sub.plan ? "Canceling..." : "Cancel"}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </CardContent>
    </Card>
  );
} 
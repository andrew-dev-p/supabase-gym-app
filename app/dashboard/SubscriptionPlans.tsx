"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSelect = async (planName: string) => {
    setSelected(planName);
    setMessage(null);
    setError(null);
    if (!user) {
      setError("You must be signed in to subscribe.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data: activeSubs, error: activeError } = await fetch(`/api/active-subscription?userId=${user.id}`)
        .then(res => res.json());
      if (activeError) {
        setError(activeError);
        setCheckoutLoading(false);
        return;
      }
      if (activeSubs && activeSubs.length > 0) {
        setError("You already have an active subscription. Please cancel it before purchasing a new one.");
        setCheckoutLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
    }
    setCheckoutLoading(false);
  };

  return (
    <Card className="mt-8">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Choose a Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`cursor-pointer transition-all ${selected === plan.name ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"}`}>
              <CardContent className="p-4 flex flex-col items-start">
                <div className="text-lg font-bold">{plan.name}</div>
                <div className="text-2xl font-semibold mb-2">${plan.price}</div>
                <div className="text-gray-500">{plan.duration}</div>
                <Button
                  className="mt-2"
                  variant={selected === plan.name ? "default" : "outline"}
                  disabled={checkoutLoading}
                  onClick={() => handleSelect(plan.name)}
                >
                  {selected === plan.name ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {checkoutLoading && <div className="text-blue-600 mt-4">Redirecting to payment...</div>}
        {message && <Alert variant="default" className="mt-4"><AlertDescription>{message}</AlertDescription></Alert>}
        {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
      </CardContent>
    </Card>
  );
} 
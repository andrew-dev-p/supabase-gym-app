"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Profile from "./profile";
import SubscriptionPlans from "./SubscriptionPlans";
import MySubscriptions from "./MySubscriptions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showMsg, setShowMsg] = useState(true);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success || canceled) setShowMsg(true);
  }, [success, canceled]);

  return (
    <div>
      {showMsg && (success || canceled) && (
        <Alert variant={success ? "default" : "destructive"} className="mb-4">
          <AlertDescription>
            {success && "Payment successful! Your subscription is now active."}
            {canceled && "Payment canceled. No changes were made."}
            <button className="ml-4 text-xs underline" onClick={() => setShowMsg(false)}>Dismiss</button>
          </AlertDescription>
        </Alert>
      )}
      <SignedIn>
        <Card className="container py-8">
          <CardContent>
            <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard!</h1>
            <p className="mb-6">This page is protected and only visible to authenticated users.</p>
            <Profile />
            <SubscriptionPlans />
            <MySubscriptions />
          </CardContent>
        </Card>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
} 
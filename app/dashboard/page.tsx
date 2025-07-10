"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Profile from "./profile";
import SubscriptionPlans from "./SubscriptionPlans";
import MySubscriptions from "./MySubscriptions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showMsg, setShowMsg] = useState(true);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success || canceled) {
      setShowMsg(true);
    }
  }, [success, canceled]);

  return (
    <>
      {showMsg && (success || canceled) && (
        <div className={`mb-4 p-3 rounded ${success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {success && "Payment successful! Your subscription is now active."}
          {canceled && "Payment canceled. No changes were made."}
          <button className="ml-4 text-xs underline" onClick={() => setShowMsg(false)}>Dismiss</button>
        </div>
      )}
      <SignedIn>
        <main className="container py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard!</h1>
          <p>This page is protected and only visible to authenticated users.</p>
        </main>
        <Profile />
        <SubscriptionPlans />
        <MySubscriptions />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 
"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Profile from "./profile";
import SubscriptionPlans from "./SubscriptionPlans";
import MySubscriptions from "./MySubscriptions";

export default function DashboardPage() {
  return (
    <>
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
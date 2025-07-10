"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Profile from "./profile";

export default function DashboardPage() {
  return (
    <>
      <SignedIn>
        <main className="container py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard!</h1>
          <p>This page is protected and only visible to authenticated users.</p>
        </main>
        <Profile />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 
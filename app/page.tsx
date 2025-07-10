import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container py-8">
      <Card>
        <CardContent className="py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Gym App!</h1>
          <p className="mb-6">Sign in to access your dashboard and manage your fitness journey.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

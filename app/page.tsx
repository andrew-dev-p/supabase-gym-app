import Link from "next/link";

export default function Home() {
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Gym App!</h1>
      <p className="mb-6">Sign in to access your dashboard and manage your fitness journey.</p>
      <Link href="/dashboard">
        <button className="btn btn-primary">Go to Dashboard</button>
      </Link>
    </main>
  );
}

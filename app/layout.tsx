import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym App",
  description: "A gym app built with Next.js, TypeScript, and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="w-full border-b mb-4">
            <nav className="container flex items-center justify-between py-4">
              <div className="font-bold text-xl">Gym App</div>
              <div className="flex gap-2 items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn btn-primary">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn btn-secondary">Sign Up</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </nav>
          </header>
          <div>{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}

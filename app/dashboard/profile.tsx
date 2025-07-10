"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("full_name, avatar_url, created_at")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setProfile(data);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditAvatar(profile.avatar_url || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: editName, avatar_url: editAvatar });
    if (error) setError(error.message);
    else {
      setSuccess("Profile updated!");
      setProfile({ ...profile, full_name: editName, avatar_url: editAvatar } as Profile);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Card className="mt-6">
      <CardContent>
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        {loading && <div>Loading profile...</div>}
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mb-2">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && profile && (
          <>
            <div><b>Name:</b> {profile.full_name || "-"}</div>
            <div><b>Joined:</b> {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</div>
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full mt-2" />
            )}
          </>
        )}
        <form onSubmit={handleUpdate} className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <Input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Avatar URL</label>
            <Input
              type="text"
              value={editAvatar}
              onChange={e => setEditAvatar(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

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
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <div className="border rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <div><b>Name:</b> {profile.full_name || "-"}</div>
        <div><b>Joined:</b> {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</div>
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full mt-2" />
        )}
      </div>
      <form onSubmit={handleUpdate} className="mt-4 space-y-2">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            type="text"
            value={editAvatar}
            onChange={e => setEditAvatar(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
} 
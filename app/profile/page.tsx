"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, MessageSquare, Clock, AlertTriangle, FileText } from "lucide-react"
import { useUser } from "@/lib/user-context"

function ProfilePage() {
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    role: "user",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use user context data
  useEffect(() => {
    if (user) {
      setProfile({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        bio: "", // Bio field not available in User type
        role: user.role,
      });
      setLoading(false);
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setProfile({ ...profile, role: value });
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => setEditing(false);

  const handleSave = () => {
    // Replace with real API call to save profile
    setEditing(false);
  };

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Clock className="animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>
            Profile
            <Badge variant="outline" className="ml-2 capitalize">{profile.role}</Badge>
          </CardTitle>
          <CardDescription>
            View and edit your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="w-full border rounded px-3 py-2"
                value={profile.bio}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="role">
                Role
              </label>
              <Select
                value={profile.role}
                onValueChange={handleRoleChange}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              {editing ? (
                <>
                  <Button type="submit" variant="default">
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button type="button" variant="secondary" onClick={handleEdit}>
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;

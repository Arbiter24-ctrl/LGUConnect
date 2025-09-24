"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Search, Eye, MessageSquare, Clock, AlertTriangle, FileText } from "lucide-react"
import { useUser } from "../../lib/user-context"

export default function ProfilePage() {
  const { user, loading } = useUser()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "user",
  })
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use user context data with proper error handling
  useEffect(() => {
    try {
      if (user && user.first_name && user.last_name && user.email && user.role) {
        setProfile({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        })
        setIsLoading(false)
      } else if (!loading) {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('ProfilePage useEffect error:', error)
      setIsLoading(false)
    }
  }, [user, loading])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (value) => {
    setProfile({ ...profile, role: value })
  }

  const handleEdit = () => setEditing(true)

  const handleCancel = () => setEditing(false)

  const handleSave = () => {
    // Replace with real API call to save profile
    setEditing(false)
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Clock className="animate-spin mr-2" />
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <Badge variant="outline" className="text-sm capitalize">
            {profile.role}
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSave()
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="role">
                        Role
                      </label>
                      <Select
                        value={profile.role}
                        onValueChange={handleRoleChange}
                        disabled={!editing}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="official">Official</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  

                  <div className="flex gap-3 pt-4">
                    {editing ? (
                      <>
                        <Button type="submit" className="min-w-24">
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button type="button" variant="default" onClick={handleEdit} className="min-w-24">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Label from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [hasPassword, setHasPassword] = useState(true)

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile({
            name: data.user.name || '',
            email: data.user.email || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [])

  // Fallback to session data
  useEffect(() => {
    if (session?.user && !profile.name && !profile.email) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session, profile.name, profile.email])

  const handleProfileSave = async () => {
    if (!profile.name.trim()) {
      addToast({ title: 'Error', description: 'Name is required.', variant: 'error' })
      return
    }
    if (!profile.email.trim()) {
      addToast({ title: 'Error', description: 'Email is required.', variant: 'error' })
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update the session so the sidebar reflects changes
      await updateSession({ name: data.user.name, email: data.user.email })

      addToast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (hasPassword && !passwords.currentPassword) {
      addToast({ title: 'Error', description: 'Current password is required.', variant: 'error' })
      return
    }
    if (!passwords.newPassword) {
      addToast({ title: 'Error', description: 'New password is required.', variant: 'error' })
      return
    }
    if (passwords.newPassword.length < 10) {
      addToast({ title: 'Error', description: 'Password must be at least 10 characters.', variant: 'error' })
      return
    }
    if (!/[A-Z]/.test(passwords.newPassword) || !/[a-z]/.test(passwords.newPassword) || !/[0-9]/.test(passwords.newPassword)) {
      addToast({ title: 'Error', description: 'Password must contain uppercase, lowercase, and a number.', variant: 'error' })
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast({ title: 'Error', description: 'Passwords do not match.', variant: 'error' })
      return
    }

    try {
      setPasswordLoading(true)
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword || undefined,
          newPassword: passwords.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setHasPassword(true)

      addToast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password.',
        variant: 'error',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Profile</h1>
        <p className="text-text-secondary">Manage your personal information and security settings</p>
      </div>

      <div className="space-y-8">
        {/* Avatar & Basic Info */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Personal Information</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-2xl">
                {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-text-primary">{profile.name || 'User'}</p>
              <p className="text-sm text-text-secondary">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com"
              />
              <p className="text-xs text-text-secondary mt-1">
                Changing your email will require you to log in again
              </p>
            </div>

            <Button onClick={handleProfileSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Change Password</h2>
          <p className="text-sm text-text-secondary mb-6">
            Update your password to keep your account secure
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <p className="text-xs text-text-secondary mt-1">
                Minimum 10 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            <Button onClick={handlePasswordChange} disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </section>

        {/* Account Info */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-secondary">Account ID</span>
              <span className="text-sm text-text-primary font-mono">{session?.user?.id || '...'}</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-secondary">Authentication</span>
              <span className="text-sm text-text-primary">Email & Password</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

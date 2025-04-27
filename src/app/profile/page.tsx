'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState(user)
  const router = useRouter()

  useEffect(() => {
    if (user?.firstLogin) {
      setIsChangePasswordDialogOpen(true)
    }
  }, [user])

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedUser(prev => ({ ...prev!, [name]: value }))
  }

  

  const handleSave = async () => {
    try {
      //await updateUser(user.id, editedUser!)
      setIsEditMode(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    try {
      //await changePassword(user!.id, currentPassword, newPassword)
      toast({
        title: "Password changed",
        description: "Your password has been successfully changed.",
      })
      if (user?.firstLogin) {
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={editedUser?.username || ''}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              {/* <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={editedUser?.fullName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={editedUser?.email || ''}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div> */}
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={editedUser?.role || ''}
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {isEditMode ? (
                <>
                  <Button onClick={() => setIsEditMode(false)} variant="outline">Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isChangePasswordDialogOpen} onOpenChange={open => {
            if (!user?.firstLogin) {
              setIsChangePasswordDialogOpen(open)
            }
          }}>
            <DialogTrigger asChild>
              <Button>Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{user?.firstLogin ? 'Change Your Password' : 'Change Password'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleChangePassword}>
                <div className="grid gap-4 py-4">
                  {!user?.firstLogin && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currentPassword" className="text-right">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="col-span-3"
                        required
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPassword" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Change Password</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}


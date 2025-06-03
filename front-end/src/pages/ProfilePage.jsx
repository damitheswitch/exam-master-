
    import React, { useState, useContext, useEffect } from 'react';
    import { AuthContext } from '@/App';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { User, Mail, Shield, Save, Edit2, XCircle } from 'lucide-react';

    const ProfilePage = () => {
      const { user, updateUser } = useContext(AuthContext);
      const { toast } = useToast();

      const [isEditing, setIsEditing] = useState(false);
      const [formData, setFormData] = useState({
        name: '',
        email: '',
      });
      const [currentPassword, setCurrentPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');

      useEffect(() => {
        if (user) {
          setFormData({ name: user.name, email: user.email });
        }
      }, [user]);

      if (!user) {
        return <p className="text-center text-slate-400">Loading profile...</p>;
      }

      const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
      };

      const handleProfileUpdate = (e) => {
        e.preventDefault();
        if (formData.name.trim() === '') {
            toast({ variant: "destructive", title: "Update Failed", description: "Name cannot be empty." });
            return;
        }
        updateUser({ ...user, ...formData });
        setIsEditing(false);
      };
      
      const handlePasswordChange = (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
          toast({ variant: "destructive", title: "Password Change Failed", description: "New passwords do not match." });
          return;
        }
        if (newPassword.length < 6) {
          toast({ variant: "destructive", title: "Password Change Failed", description: "New password must be at least 6 characters long." });
          return;
        }

        const users = JSON.parse(localStorage.getItem('exammaster_users') || '[]');
        const currentUserIndex = users.findIndex(u => u.id === user.id);

        if (currentUserIndex === -1 || users[currentUserIndex].password !== currentPassword) {
            toast({ variant: "destructive", title: "Password Change Failed", description: "Incorrect current password." });
            return;
        }
        
        users[currentUserIndex].password = newPassword;
        localStorage.setItem('exammaster_users', JSON.stringify(users));
        
        toast({ title: "Password Changed", description: "Your password has been updated successfully." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      };


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto py-8"
        >
          <Card className="bg-slate-800/70 border-slate-700 shadow-2xl">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold gradient-text">Your Profile</CardTitle>
                <CardDescription className="text-slate-400">Manage your personal information.</CardDescription>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100">
                {isEditing ? <XCircle className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300 flex items-center"><User className="mr-2 h-4 w-4 text-primary" />Full Name</Label>
                  <Input id="name" type="text" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="bg-slate-700 border-slate-600 text-slate-50 disabled:opacity-70 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300 flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" />Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-slate-700 border-slate-600 text-slate-50 disabled:opacity-70 disabled:cursor-not-allowed" />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <Label className="text-slate-300 flex items-center"><Shield className="mr-2 h-4 w-4 text-primary" />Role</Label>
                  <Input type="text" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled className="bg-slate-700 border-slate-600 text-slate-50 disabled:opacity-70 disabled:cursor-not-allowed" />
                </div>
                {isEditing && (
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 text-white">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                )}
              </form>

              <hr className="border-slate-700" />

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-200">Change Password</h3>
                 <div>
                  <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="bg-slate-700 border-slate-600 text-slate-50" />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-slate-700 border-slate-600 text-slate-50" />
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword" className="text-slate-300">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className="bg-slate-700 border-slate-600 text-slate-50" />
                </div>
                <Button type="submit" variant="secondary" className="w-full bg-slate-600 hover:bg-slate-500 text-slate-100">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ProfilePage;
  
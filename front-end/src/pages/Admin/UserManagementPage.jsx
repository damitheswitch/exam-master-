
    import React, { useState, useEffect, useContext } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { AuthContext } from '@/App';
    import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


    const UserManagementPage = () => {
      const [users, setUsers] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [editingUser, setEditingUser] = useState(null);
      const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
      const { toast } = useToast();
      const { ROLES, user: currentUser } = useContext(AuthContext);

      useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem('exammaster_users') || '[]');
        setUsers(storedUsers);
      }, []);

      const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
      };

      const filteredUsers = users.filter(user => {
        const name = user.name || '';
        const email = user.email || '';
        const role = user.role || '';
        
        return (
          name.toLowerCase().includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm) ||
          role.toLowerCase().includes(searchTerm)
        );
      });

      const openDialog = (userToEdit = null) => {
        setEditingUser(userToEdit);
        if (userToEdit) {
          setFormData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, password: '' });
        } else {
          setFormData({ name: '', email: '', role: '', password: '' });
        }
        setIsDialogOpen(true);
      };

      const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: '', password: '' });
      };

      const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
      
      const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role: value }));
      };

      const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.role) {
          toast({ variant: "destructive", title: "Error", description: "All fields except password are required." });
          return;
        }
        if (!editingUser && !formData.password) {
          toast({ variant: "destructive", title: "Error", description: "Password is required for new users." });
          return;
        }

        let updatedUsers;
        if (editingUser) {
          updatedUsers = users.map(u => 
            u.id === editingUser.id ? { ...u, ...formData, password: formData.password || u.password } : u
          );
          toast({ title: "User Updated", description: `${formData.name}'s details have been updated.` });
        } else {
          const newUser = { id: Date.now().toString(), ...formData };
          updatedUsers = [...users, newUser];
          toast({ title: "User Added", description: `${formData.name} has been added.` });
        }
        localStorage.setItem('exammaster_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        closeDialog();
      };

      const handleDeleteUser = (userId) => {
        if (userId === currentUser.id) {
          toast({ variant: "destructive", title: "Error", description: "You cannot delete your own account." });
          return;
        }
        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('exammaster_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        toast({ title: "User Deleted", description: "User has been successfully deleted." });
      };
      
      const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      };

      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      };

      return (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-bold gradient-text">User Management</CardTitle>
              <CardDescription className="text-slate-400">Manage all users within the ExamMaster system.</CardDescription>
            </CardHeader>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={handleSearch}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] bg-slate-800 border-slate-700 text-slate-50">
                <DialogHeader>
                  <DialogTitle className="text-primary">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="sm:text-right text-slate-300">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleFormChange} className="col-span-1 sm:col-span-3 bg-slate-700 border-slate-600" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right text-slate-300">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} className="col-span-3 bg-slate-700 border-slate-600" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right text-slate-300">Password</Label>
                    <Input id="password" name="password" type="password" placeholder={editingUser ? "Leave blank to keep current" : "Required"} value={formData.password} onChange={handleFormChange} className="col-span-3 bg-slate-700 border-slate-600" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right text-slate-300">Role</Label>
                    <Select name="role" onValueChange={handleRoleChange} value={formData.role}>
                      <SelectTrigger className="col-span-1 sm:col-span-3 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                        <SelectItem value={ROLES.TEACHER}>Teacher</SelectItem>
                        <SelectItem value={ROLES.STUDENT}>Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button></DialogClose>
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/50">
                        <TableHead className="text-slate-300 whitespace-nowrap">Name</TableHead>
                        <TableHead className="text-slate-300 hidden sm:table-cell">Email</TableHead>
                        <TableHead className="text-slate-300 whitespace-nowrap">Role</TableHead>
                        <TableHead className="text-right text-slate-300 whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-slate-700 hover:bg-slate-750/50">
                        <TableCell className="font-medium text-slate-100">
                          <div className="flex flex-col sm:flex-row gap-1">
                            <span>{user.name}</span>
                            <span className="text-xs text-slate-400 sm:hidden">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 hidden sm:table-cell">{user.email}</TableCell>
                        <TableCell className="text-slate-300 capitalize">{user.role}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(user)} className="text-blue-400 hover:text-blue-300 hover:bg-slate-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={user.id === currentUser.id} className="text-red-400 hover:text-red-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-[425px] bg-slate-800 border-slate-700 text-slate-50">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  This action cannot be undone. This will permanently delete the user account for {user.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete user
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
                {filteredUsers.length === 0 && (
                  <p className="text-center py-8 text-slate-400">No users found matching your criteria.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    };

    export default UserManagementPage;
  
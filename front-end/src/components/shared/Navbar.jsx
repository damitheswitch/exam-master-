import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, BookOpenCheck, Edit3, Users, FileText, TrendingUp, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewExamBadge from './NewExamBadge';

const Navbar = () => {
  const { user, logout, ROLES } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navItemVariants = {
    hover: { scale: 1.05, color: "var(--accent)" },
    tap: { scale: 0.95 }
  };
  
  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold gradient-text">
          ExamMaster
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-slate-200 hover:text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:space-x-2">
              {user ? (
                <>
                  {user.role === ROLES.ADMIN && (
                    <>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Dashboard</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/admin/users"><Users className="mr-2 h-4 w-4" />Users</Link></Button>
                      </motion.div>
                       <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/admin/questions"><Edit3 className="mr-2 h-4 w-4" />Questions</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/admin/exams"><FileText className="mr-2 h-4 w-4" />Exams</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/admin/performance"><TrendingUp className="mr-2 h-4 w-4" />Performance</Link></Button>
                      </motion.div>
                    </>
                  )}
                  {user.role === ROLES.TEACHER && (
                    <>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/teacher/questions"><Edit3 className="mr-2 h-4 w-4" />Questions</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/teacher/exams"><FileText className="mr-2 h-4 w-4" />Exams</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/teacher/performance"><TrendingUp className="mr-2 h-4 w-4" />Performance</Link></Button>
                      </motion.div>
                    </>
                  )}
                  {user.role === ROLES.STUDENT && (
                     <>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild><Link to="/student"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></Button>
                      </motion.div>
                      <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                        <Button variant="ghost" asChild>
                          <Link to="/student/exams" className="flex items-center">
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Available Exams
                            <NewExamBadge />
                          </Link>
                        </Button>
                      </motion.div>
                    </>
                  )}
                  <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                    <Button variant="ghost" asChild><Link to="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleLogout} variant="destructive"><LogOut className="mr-2 h-4 w-4" />Logout</Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                    <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild><Link to="/register">Register</Link></Button>
                  </motion.div>
                </>
              )}
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-slate-900/95 flex flex-col pt-20 pb-6 px-4 overflow-y-auto"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  {user.role === ROLES.ADMIN && (
                    <>
                      <MobileNavLink to="/admin" icon={<LayoutDashboard className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</MobileNavLink>
                      <MobileNavLink to="/admin/users" icon={<Users className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Users</MobileNavLink>
                      <MobileNavLink to="/admin/questions" icon={<Edit3 className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Questions</MobileNavLink>
                      <MobileNavLink to="/admin/exams" icon={<FileText className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Exams</MobileNavLink>
                      <MobileNavLink to="/admin/performance" icon={<TrendingUp className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Performance</MobileNavLink>
                    </>
                  )}
                  {user.role === ROLES.TEACHER && (
                    <>
                      <MobileNavLink to="/teacher/questions" icon={<Edit3 className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Questions</MobileNavLink>
                      <MobileNavLink to="/teacher/exams" icon={<FileText className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Exams</MobileNavLink>
                      <MobileNavLink to="/teacher/performance" icon={<TrendingUp className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Performance</MobileNavLink>
                    </>
                  )}
                  {user.role === ROLES.STUDENT && (
                    <>
                      <MobileNavLink to="/student" icon={<LayoutDashboard className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                      <MobileNavLink to="/student/exams" icon={<BookOpenCheck className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>
                        <span className="flex items-center">
                          Available Exams
                          <NewExamBadge />
                        </span>
                      </MobileNavLink>
                    </>
                  )}
                  <MobileNavLink to="/profile" icon={<User className="mr-3 h-5 w-5" />} onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                  <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </Button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>Login</MobileNavLink>
                  <MobileNavLink to="/register" onClick={() => setMobileMenuOpen(false)} variant="primary">Register</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Mobile navigation link component
const MobileNavLink = ({ to, children, icon, onClick, variant = "ghost" }) => {
  return (
    <Button variant={variant} asChild className="w-full justify-start text-left py-6 px-4" size="lg">
      <Link to={to} onClick={onClick} className="flex items-center text-lg">
        {icon}
        {children}
      </Link>
    </Button>
  );
};

export default Navbar;
  
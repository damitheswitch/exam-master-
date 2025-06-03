import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try to login with the API
      const response = await authAPI.login(email, password);
      
      // The API response should already be in the correct format
      const userData = {
        id: response.id,
        name: `${response.first_name || ''} ${response.last_name || ''}`.trim() || response.email.split('@')[0],
        email: response.email,
        role: response.role || 'student',
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      };

      // Update context
      login(userData);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      // Redirect to the requested page or home
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center py-12"
    >
      <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold gradient-text">Welcome Back!</CardTitle>
          <CardDescription className="text-slate-400">Sign in to access your ExamMaster account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          

        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto hover:underline">
              <Link to="/register">Register here</Link>
            </Button>
          </p>
          <p className="text-sm text-slate-400">
            Forgot your password?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto hover:underline">
              <Link to="/forgot-password">Reset it here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
  
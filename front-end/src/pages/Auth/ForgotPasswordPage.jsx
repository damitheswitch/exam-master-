import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const { toast } = useToast();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/accounts/password-reset/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetCodeSent(true);
        setResetCode(data.reset_code); // For development only
        toast({
          title: "Reset Code Sent",
          description: "Please check your email for the password reset code.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to send reset code. Please try again.",
        });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
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
          <CardTitle className="text-3xl font-bold gradient-text">Forgot Password</CardTitle>
          <CardDescription className="text-slate-400">
            {resetCodeSent 
              ? "We've sent a reset code to your email" 
              : "Enter your email to receive a password reset code"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetCodeSent ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
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
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-400 font-medium">Reset code sent!</p>
                </div>
                <p className="text-slate-300 mt-1 text-sm">
                  Check your email for a 6-digit reset code.
                </p>
                {resetCode && (
                  <p className="text-yellow-400 mt-2 text-sm">
                    <strong>Development Mode:</strong> Your reset code is: {resetCode}
                  </p>
                )}
              </div>
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
              >
                <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
                  Continue to Reset Password
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Button variant="link" asChild className="text-slate-400 p-0 h-auto hover:underline">
            <Link to="/login" className="flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordPage; 
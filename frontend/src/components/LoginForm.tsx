import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationForm } from '@/components/RegistrationForm';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const LoginForm = () => {
  const { login, loginWithOAuth, resetPassword, verifyOTP, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      console.log("Google Login Response:", response);
      if (response.code) {
        try {
          const backendSuccess = await loginWithOAuth('google', response.code);
          if (!backendSuccess) {
            setFormError('Google login failed: Unable to authenticate with server.');
          }
        } catch (error) {
          console.error("Google auth-code exchange error:", error);
          setFormError('Failed to process Google login. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error("Google login failed: No authorization code received.", response);
        setFormError('Google login failed. Please try again.');
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      setFormError(`Google login failed: ${errorResponse.error_description || 'Unknown error'}`);
      setIsLoading(false);
    },
    flow: 'auth-code',
    scope: 'openid profile email',
    clientId: '85410249110-3fa4nl60db577s2fpu2p6f5mpa7o8ap5.apps.googleusercontent.com',
  });

  if (showRegistration) {
    return <RegistrationForm onSwitchToLogin={() => setShowRegistration(false)} />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setFormError('Invalid email or password. Please try again.');
        const form = e.currentTarget;
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 600);
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLoginClick = () => {
    setIsLoading(true);
    googleLogin();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    if (resetStep === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetEmail)) {
        setFormError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
      const success = await resetPassword(resetEmail);
      if (success) {
        setResetStep('otp');
        setResendCooldown(60);
        setFormSuccess('OTP sent to your email.');
      } else {
        setFormError('Failed to send OTP. Please check your email and try again.');
      }
    } else if (resetStep === 'otp') {
      if (!/^\d{6}$/.test(otp)) {
        setFormError('OTP must be a 6-digit number.');
        setIsLoading(false);
        return;
      }
      const success = await verifyOTP(otp);
      if (success) {
        setResetStep('password');
        setFormSuccess('OTP verified successfully.');
      } else {
        setFormError('Invalid OTP. Please try again.');
      }
    } else if (resetStep === 'password') {
      if (newPassword.length < 6) {
        setFormError('New password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      const success = await updatePassword(newPassword);
      if (success) {
        setResetStep('email');
        setResetEmail('');
        setOtp('');
        setNewPassword('');
        setFormSuccess('Password updated successfully. Please log in.');
      } else {
        setFormError('Failed to update password. Please try again.');
      }
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);
    const success = await resetPassword(resetEmail);
    if (success) {
      setResendCooldown(60);
      setFormSuccess('OTP resent successfully.');
    } else {
      setFormError('Failed to resend OTP. Please try again.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <motion.button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-20 p-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full hover:scale-110 transition-transform border border-white/20 dark:border-gray-700/50"
        whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
      </motion.button>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-lg opacity-50 animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 dark:bg-yellow-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-lg opacity-50 animate-bounce" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 dark:bg-pink-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-lg opacity-50 animate-bounce" style={{ animationDelay: '4s', animationDuration: '6s' }}></div>
      </div>

      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={shouldReduceMotion ? {} : { rotateY: [0, 360], scale: [1, 1.1, 1] }}
            transition={shouldReduceMotion ? {} : { rotateY: { duration: 2, repeat: 2 }, scale: { duration: 2, repeat: 2 } }}
          >
            🌐
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WorkSphere
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Real-time employee management system</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0 dark:border dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="dark:text-gray-300">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={() => { setFormError(''); setFormSuccess(''); }}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="login" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="reset" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {(formError || formSuccess) && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm text-center p-2 rounded border ${formError ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}
                    role="alert"
                    aria-live="assertive"
                  >
                    {formError || formSuccess}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-white">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@worksphere.com"
                        className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                        required
                        aria-describedby="email-error"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="dark:text-white">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                        required
                        aria-describedby="password-error"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 dark:hover:bg-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <motion.div whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? (
                        <motion.span
                          animate={shouldReduceMotion ? {} : { opacity: [1, 0.5, 1] }}
                          transition={shouldReduceMotion ? {} : { duration: 1, repeat: Infinity }}
                        >
                          Signing In...
                        </motion.span>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </motion.div>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground dark:text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <motion.div whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={handleOAuthLoginClick}
                      disabled={isLoading}
                      className="w-full justify-center space-x-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-center">
                    <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                    <button
                      onClick={() => setShowRegistration(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                    >
                      Register here
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                {(formError || formSuccess) && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm text-center p-2 rounded border ${formError ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}
                    role="alert"
                    aria-live="assertive"
                  >
                    {formError || formSuccess}
                  </motion.div>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetStep === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="dark:text-white">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        required
                        aria-describedby="reset-email-error"
                      />
                    </div>
                  )}

                  {resetStep === 'otp' && (
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="dark:text-white">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        required
                        aria-describedby="otp-error"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Check your email for the 6-digit code (Demo: 123456)
                      </p>
                      <Button
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={isLoading || resendCooldown > 0}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </Button>
                    </div>
                  )}

                  {resetStep === 'password' && (
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="dark:text-white">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          required
                          aria-describedby="new-password-error"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0 dark:hover:bg-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {resetStep === 'email' && 'Send OTP'}
                    {resetStep === 'otp' && 'Verify OTP'}
                    {resetStep === 'password' && 'Update Password'}
                  </Button>
                </form>

                {resetStep !== 'email' && (
                  <Button
                    variant="outline"
                    className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    onClick={() => {
                      setResetStep('email');
                      setOtp('');
                      setNewPassword('');
                      setFormError('');
                      setFormSuccess('');
                    }}
                  >
                    Back to Email
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
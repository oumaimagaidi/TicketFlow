import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketIcon, Mail, Lock, User, AlertCircle, Loader2, Sparkles, Check, Server, Shield, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isAnimating, setIsAnimating] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
    }));
    setParticles(newParticles);

    checkBackendConnection();
    
    setIsAnimating(true);
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsBackendConnected(response.ok);
    } catch (error) {
      setIsBackendConnected(false);
    }
  };

  if (user) {
    return <Navigate to="/tickets" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        className: 'gradient-primary text-white',
      });
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await signup(signupEmail, signupPassword, signupName);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to TicketHub.',
        className: 'gradient-primary text-white',
      });
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden gradient-hero p-4 md:p-6">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/10 animate-pulse"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.speed * 4}s`,
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
        
        {/* Large floating elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-slower" />
      </div>

      {/* Sparkles decoration */}
      <div className="absolute top-8 right-8 animate-bounce">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <div className="absolute bottom-8 left-8 animate-bounce delay-300">
        <Sparkles className="h-6 w-6 text-primary/60" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-8 lg:gap-12">
          <div 
            className={`lg:w-1/2 text-center lg:text-left transition-all duration-700 ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
          >
            <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-6 hover:scale-105 transition-transform duration-300">
              <div 
                className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow hover:shadow-xl transition-shadow duration-300"
              >
                <TicketIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="font-display font-bold text-4xl lg:text-5xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                TicketHub
              </h1>
            </div>

            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4 animate-fade-in">
              Manage Tickets <span className="text-primary">Effortlessly</span>
            </h2>
            
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl animate-fade-in delay-100">
              A modern, secure platform for managing support tickets with real-time updates and team collaboration.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-xl">
              {[
                { icon: Shield, text: 'Enterprise-grade Security', delay: 'delay-100' },
                { icon: Server, text: 'Real-time Updates', delay: 'delay-200' },
                { icon: Key, text: 'Role-based Access', delay: 'delay-300' },
                { icon: Check, text: 'Team Collaboration', delay: 'delay-400' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 animate-slide-up ${feature.delay} hover:scale-[1.02] hover:border-primary/30 transition-all duration-300`}
                >
                  <div className="p-2 rounded-lg gradient-primary group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 animate-fade-in delay-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-primary-foreground/70">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">256-bit</div>
                <div className="text-sm text-primary-foreground/70">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-primary-foreground/70">Support</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth card */}
          <div 
            className={`lg:w-1/2 max-w-md transition-all duration-700 delay-300 ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 overflow-hidden hover:shadow-3xl transition-shadow duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              <CardHeader className="space-y-1 pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isBackendConnected ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    <div className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {isBackendConnected ? 'Backend Connected' : 'Backend Offline'}
                  </div>
                </div>
                <CardDescription className="text-base">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs 
                  defaultValue="login" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8 p-1 h-auto bg-muted/50 rounded-xl">
                    <TabsTrigger 
                      value="login"
                      className="data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg py-3 transition-all duration-300"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg py-3 transition-all duration-300"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-3">
                        <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@company.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                          <a href="#" className="text-xs text-primary hover:underline transition-colors duration-300">
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {error && activeTab === 'login' && (
                        <div 
                          className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-scale-in"
                        >
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <span className="text-sm text-destructive">{error}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl text-base font-medium gradient-primary hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-11 rounded-lg hover:scale-[1.02] transition-transform duration-300">
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>
                        <Button variant="outline" className="h-11 rounded-lg hover:scale-[1.02] transition-transform duration-300">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-5">
                      <div className="space-y-3">
                        <Label htmlFor="signup-name" className="text-sm font-medium">Display Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Oumaima_Gaidi"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                            required
                            minLength={3}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This will be your public display name
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="name@company.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="••••••••"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                              required
                              minLength={6}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                              id="signup-confirm-password"
                              type="password"
                              placeholder="••••••••"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-300"
                              required
                              minLength={6}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password requirements */}
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
                        <h4 className="text-sm font-medium text-primary mb-2">Password Requirements</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${signupPassword.length >= 6 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                            At least 6 characters
                          </li>
                          <li className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${signupPassword === signupConfirmPassword && signupPassword ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                            Passwords match
                          </li>
                        </ul>
                      </div>

                      {error && activeTab === 'signup' && (
                        <div 
                          className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-scale-in"
                        >
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <span className="text-sm text-destructive">{error}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl text-base font-medium gradient-primary hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground px-4">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline transition-colors duration-300">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-primary hover:underline transition-colors duration-300">Privacy Policy</a>.
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Demo credentials */}
            
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in delay-1000">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} TicketHub. Built with React, TypeScript, and Django.
            {' '}
            <a 
              href="http://localhost:8000/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors duration-300 inline-flex items-center gap-1 group"
            >
              Open Django Admin 
              <span className="group-hover:translate-x-1 transition-transform duration-300">↗</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
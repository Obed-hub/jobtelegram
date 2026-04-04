import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, LogIn, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthForm() {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, sendPasswordlessLink, userAvatarUrl } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'link'>('password');
  const [linkSent, setLinkSent] = useState(false);

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    if (!email) return;
    if (authMethod === 'password' && !password) return;
    
    setIsLoading(true);
    try {
      if (authMethod === 'link') {
        await sendPasswordlessLink(email);
        setLinkSent(true);
      } else {
        if (type === 'login') {
          await loginWithEmail(email, password);
        } else {
          await signUpWithEmail(email, password);
        }
      }
    } catch (err) {
      // Errors handled in context toasts
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-primary/10 mb-4 shadow-2xl relative group">
          <img src={userAvatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">GigSpark</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to save your matches and AI history</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl border border-border/50">
          <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
            <LogIn className="w-4 h-4 mr-2" /> Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
            <UserPlus className="w-4 h-4 mr-2" /> Sign Up
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {linkSent ? (
            <motion.div 
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 animate-bounce">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Check your inbox!</h3>
              <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                We've sent a secure sign-in link to <span className="font-bold text-foreground">{email}</span>. <br/>Click the link to finish signing up.
              </p>
              
              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-left">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Trouble finding it?</p>
                <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-3">
                  <li>Check your <strong>Spam</strong> or Promotions folder</li>
                  <li>Ensure the email above is typed correctly</li>
                  <li>Clicking the link in a different browser/device? We'll ask for your email again for security.</li>
                </ul>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLinkSent(false)}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10 mt-4"
              >
                Resend or change email
              </Button>
            </motion.div>
          ) : (
            <TabsContent value="login" key="login" className="space-y-4 outline-none">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <button 
                      onClick={() => setAuthMethod(authMethod === 'password' ? 'link' : 'password')}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all"
                    >
                      {authMethod === 'password' ? 'Use Email Link' : 'Use Password'}
                    </button>
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary transition-all rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                {authMethod === 'password' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                      <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleEmailAuth('login')}
                  disabled={isLoading || !email || (authMethod === 'password' && !password)}
                  className="w-full h-11 rounded-xl font-bold bg-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    authMethod === 'link' ? "Send Sign-In Link" : "Sign In"
                  )}
                </Button>
              </div>
            </TabsContent>
          )}

          <TabsContent value="signup" key="signup" className="space-y-4 outline-none">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <button 
                    onClick={() => setAuthMethod(authMethod === 'password' ? 'link' : 'password')}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all"
                  >
                    {authMethod === 'password' ? 'Use Email Link' : 'Use Password'}
                  </button>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {authMethod === 'password' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="signup-password" title="signup password"  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Create Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary transition-all rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={() => handleEmailAuth('signup')}
                disabled={isLoading || !email || (authMethod === 'password' && !password)}
                className="w-full h-11 rounded-xl font-bold bg-foreground text-background hover:opacity-90 transition-all shadow-xl"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  authMethod === 'link' ? "Send Sign-In Link" : (
                    <span className="flex items-center gap-2">
                      Create Account <Sparkles className="w-4 h-4" />
                    </span>
                  )
                )}
              </Button>
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
          <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        variant="outline"
        className="w-full h-11 rounded-xl border-border/50 bg-background hover:bg-muted/50 transition-all font-semibold flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
        Google Account
      </Button>

      <p className="mt-8 text-center text-[11px] text-muted-foreground px-6 leading-relaxed">
        By continuing, you agree to our <button className="underline hover:text-primary transition-colors">Terms of Service</button> and <button className="underline hover:text-primary transition-colors">Privacy Policy</button>.
      </p>
    </motion.div>
  );
}

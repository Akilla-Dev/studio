
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/admin');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Please check your email to confirm your account!');
      setIsRegistering(false); // Switch back to login view after successful sign up
    }
    setIsLoading(false);
  };
  
  const handleQuickAccess = () => {
    router.push('/admin?demo=true');
  };


  return (
    <div className="relative flex items-center justify-center h-screen bg-background">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isRegistering ? 'Register' : 'Login'}</CardTitle>
          <CardDescription>
            {isRegistering
              ? 'Create an account to get started.'
              : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && isRegistering ? 'Signing up...' : isLoading ? 'Logging in...' : isRegistering ? 'Sign Up' : 'Login'}
            </Button>
          </form>
           <Separator className="my-4" />
            <Button variant="secondary" className="w-full" onClick={handleQuickAccess} disabled={isLoading}>
                Acceso Rápido (Demo)
            </Button>
          <div className="mt-4 text-center text-sm">
            {isRegistering ? (
              <>
                Already have an account?{' '}
                <Button variant="link" onClick={() => setIsRegistering(false)} className="p-0 h-auto align-baseline" disabled={isLoading}>
                  Login
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Button variant="link" onClick={() => setIsRegistering(true)} className="p-0 h-auto align-baseline" disabled={isLoading}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const email = session.user.email;
        if (email && !email.endsWith('@iimbg.ac.in')) {
          toast.error('Only @iimbg.ac.in emails are allowed');
          supabase.auth.signOut();
          return;
        }
        navigate('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const email = session.user.email;
        if (email && !email.endsWith('@iimbg.ac.in')) {
          toast.error('Only @iimbg.ac.in emails are allowed');
          supabase.auth.signOut();
          return;
        }
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            hd: 'iimbg.ac.in'
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Clash of Clans</CardTitle>
          <CardDescription className="text-center">Sign in with your IIM Bangalore account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full" 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign in with Google (@iimbg.ac.in)'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Only @iimbg.ac.in email addresses are allowed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
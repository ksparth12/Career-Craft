import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { directUserLogin, getDirectUser, isDirectUserLoggedIn } from "@/utils/directAuth";
import { supabase } from '@/integrations/supabase/client';

const DirectLoginTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check current direct login status
  const checkLoginStatus = () => {
    const isLoggedIn = isDirectUserLoggedIn();
    const user = getDirectUser();
    
    setCurrentUser(user);
    setResults(`Direct user logged in: ${isLoggedIn}\n\nUser data: ${JSON.stringify(user, null, 2)}`);
    
    toast({
      title: isLoggedIn ? 'Logged in' : 'Not logged in',
      description: isLoggedIn ? `As: ${user?.email}` : 'No direct user session found',
    });
  };

  // Try the direct login
  const tryDirectLogin = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      console.log(`Attempting direct login for: ${email}`);
      
      // First check if this email exists in public_profiles
      const { data: profiles, error: searchError } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('email', email);
      
      console.log('Profile search results:', profiles);
      
      if (searchError) {
        console.error('Error searching for profiles:', searchError);
        throw new Error(`Failed to search for profiles: ${searchError.message}`);
      }
      
      if (!profiles || profiles.length === 0) {
        throw new Error(`No profiles found for email: ${email}`);
      }
      
      console.log(`Found ${profiles.length} profile(s), attempting login...`);
      
      // Now try the actual login
      const result = await directUserLogin(email, password || 'anything');
      console.log('Direct login result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown login error');
      }
      
      setResults(`Login successful!\n\nUser data: ${JSON.stringify(result.user, null, 2)}`);
      setCurrentUser(result.user);
      
      toast({
        title: 'Login successful',
        description: `Logged in as: ${result.user.email}`,
      });
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Login failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a test profile
  const createTestProfile = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const testEmail = email;
      const testId = crypto.randomUUID();
      
      console.log(`Creating test profile with email: ${testEmail} and ID: ${testId}`);
      
      const { error: insertError } = await supabase
        .from('public_profiles')
        .insert({
          id: testId,
          email: testEmail,
          full_name: testEmail.split('@')[0],
          role: 'job_seeker'
        });
      
      if (insertError) {
        throw new Error(`Failed to create test profile: ${insertError.message}`);
      }
      
      setResults(`Test profile created successfully!\n\nEmail: ${testEmail}\nID: ${testId}`);
      
      toast({
        title: 'Profile created',
        description: `Test profile created for: ${testEmail}`,
      });
    } catch (err: any) {
      console.error('Profile creation failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Profile creation failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Direct Login Test</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Current User</h3>
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md mb-2">
            <pre className="whitespace-pre-wrap text-sm">
              {currentUser ? JSON.stringify(currentUser, null, 2) : 'Not logged in'}
            </pre>
          </div>
          <Button 
            onClick={checkLoginStatus} 
            variant="outline"
            className="mr-2"
          >
            Check Login Status
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Test Direct Login</h3>
          <div className="space-y-3 mb-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="max-w-md"
              />
            </div>
            <div>
              <Label htmlFor="password">Password (Optional)</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Not actually verified for direct login"
                className="max-w-md"
              />
            </div>
          </div>
          <Button 
            onClick={tryDirectLogin}
            disabled={loading}
            className="mr-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Logging in...' : 'Test Direct Login'}
          </Button>
          
          <Button 
            onClick={createTestProfile}
            disabled={loading}
            variant="outline"
            className="mr-2"
          >
            Create Test Profile
          </Button>
        </div>
        
        {results && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
            <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Results:</h3>
            <pre className="whitespace-pre-wrap text-sm">{results}</pre>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Error:</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectLoginTest; 
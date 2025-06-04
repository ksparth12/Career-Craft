import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SupabaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rawResponse, setRawResponse] = useState<any>(null);

  const testSignUp = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      // Create a test user with a random email
      const testEmail = `test${Math.floor(Math.random() * 1000000)}@example.com`;
      const testPassword = 'password123';
      
      console.log(`Attempting to create test user: ${testEmail}`);
      
      // Sign up using Supabase
      const response = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      console.log('Complete signup response:', response);
      setRawResponse(response);
      
      const { data, error: signUpError } = response;
      
      if (signUpError) {
        throw new Error(`Sign up failed: ${signUpError.message}`);
      }
      
      console.log('Sign up successful:', data);
      
      if (!data.user) {
        throw new Error('No user data returned');
      }
      
      // Try to create a profile manually
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: testEmail,
          full_name: 'Test User',
          role: 'job_seeker'
        });
      
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      setResults(`Success! Created user ${testEmail} with ID ${data.user.id}`);
      
      toast({
        title: 'Test successful',
        description: 'User created successfully',
      });
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Test failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectUser = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      // Use our custom SQL function to create a user directly
      const testEmail = email || `direct_test${Math.floor(Math.random() * 1000000)}@example.com`;
      const testPassword = password || 'password123';
      
      console.log(`Attempting to create direct user: ${testEmail}`);
      
      // Call our direct user creation function
      const response = await supabase.rpc('create_direct_user', {
        user_email: testEmail,
        user_password: testPassword,
        user_role: 'job_seeker'
      });
      
      console.log('Direct user creation complete response:', response);
      setRawResponse(response);
      
      const { data, error: directError } = response;
      
      if (directError) {
        throw new Error(`Direct user creation failed: ${directError.message}`);
      }
      
      console.log('Direct user creation response data:', data);
      
      if (!data || !data.success) {
        throw new Error(`Failed to create direct user: ${data?.error || 'Unknown error'}`);
      }
      
      setResults(`Success! Created direct user ${testEmail} with ID ${data.id}`);
      
      // If successful, try to log in the user immediately
      if (testPassword) {
        console.log('Attempting to log in with the created user');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          console.warn('Login attempt failed:', signInError);
          setResults((prev) => `${prev}\n\nNote: Created user but couldn't auto-login: ${signInError.message}`);
        } else if (signInData?.user) {
          setResults((prev) => `${prev}\n\nAuto-login successful! User is now logged in.`);
        }
      }
      
      toast({
        title: 'Direct user creation successful',
        description: 'User registered in public_profiles table',
      });
    } catch (err: any) {
      console.error('Direct user creation failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Direct user creation failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testPublicAccess = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      // Try to access public profile data
      const response = await supabase
        .from('public_profiles')
        .select('*')
        .limit(5);
      
      console.log('Public profiles response:', response);
      setRawResponse(response);
      
      const { data, error } = response;
      
      if (error) {
        throw new Error(`Public access failed: ${error.message}`);
      }
      
      setResults(`Success! Retrieved ${data.length} profile(s): ${JSON.stringify(data, null, 2)}`);
      
      toast({
        title: 'Test successful',
        description: `Retrieved ${data.length} profile(s)`,
      });
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Test failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const listAllTables = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      // Use a custom SQL query to list all tables
      const response = await supabase.rpc('list_all_tables');
      
      console.log('Tables response:', response);
      setRawResponse(response);
      
      const { data, error } = response;
      
      if (error) {
        throw new Error(`Listing tables failed: ${error.message}`);
      }
      
      setResults(`Tables in database: ${JSON.stringify(data, null, 2)}`);
      
      toast({
        title: 'Test successful',
        description: 'Retrieved database tables',
      });
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Test failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to find profiles by email
  const findProfilesByEmail = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      const searchEmail = email || prompt("Enter email to search for:");
      if (!searchEmail) {
        setError("No email provided");
        return;
      }
      
      console.log(`Looking for profiles with email: ${searchEmail}`);
      
      // Find all profiles with matching email
      const response = await supabase
        .from('public_profiles')
        .select('*')
        .eq('email', searchEmail);
      
      console.log('Search response:', response);
      setRawResponse(response);
      
      const { data, error } = response;
      
      if (error) {
        throw new Error(`Profile search failed: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        setResults(`No profiles found for email: ${searchEmail}`);
      } else {
        setResults(`Found ${data.length} profile(s) for email ${searchEmail}:\n\n${JSON.stringify(data, null, 2)}`);
      }
      
      toast({
        title: 'Search complete',
        description: `Found ${data?.length || 0} profile(s)`,
      });
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Search failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to clean up duplicate profiles
  const cleanupDuplicateProfiles = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setRawResponse(null);
    
    try {
      // First, get all profiles
      const { data: allProfiles, error: fetchError } = await supabase
        .from('public_profiles')
        .select('*');
      
      if (fetchError) {
        throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
      }
      
      if (!allProfiles || allProfiles.length === 0) {
        setResults("No profiles found to clean up.");
        return;
      }
      
      // Find unique emails and their first occurrence
      const uniqueEmails = new Map();
      const duplicates = [];
      const toKeep = [];
      
      allProfiles.forEach(profile => {
        if (!uniqueEmails.has(profile.email)) {
          uniqueEmails.set(profile.email, profile);
          toKeep.push(profile);
        } else {
          duplicates.push(profile);
        }
      });
      
      if (duplicates.length === 0) {
        setResults("No duplicate profiles found!");
        return;
      }
      
      // Confirm before deleting
      if (!confirm(`Found ${duplicates.length} duplicate profiles. Do you want to delete them?`)) {
        setResults("Cleanup cancelled by user.");
        return;
      }
      
      // Delete duplicates
      const idsToDelete = duplicates.map(p => p.id);
      const { error: deleteError } = await supabase
        .from('public_profiles')
        .delete()
        .in('id', idsToDelete);
      
      if (deleteError) {
        throw new Error(`Failed to delete duplicates: ${deleteError.message}`);
      }
      
      setResults(`Successfully cleaned up ${duplicates.length} duplicate profiles!\n\nRemaining profiles: ${toKeep.length}\n\nDeleted profiles: ${JSON.stringify(duplicates, null, 2)}`);
      
      toast({
        title: 'Cleanup successful',
        description: `Removed ${duplicates.length} duplicate profiles`,
      });
    } catch (err: any) {
      console.error('Cleanup failed:', err);
      setError(err.message || 'An unknown error occurred');
      
      toast({
        title: 'Cleanup failed',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Supabase Debug Tools</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Test Standard Signup</h3>
          <Button 
            onClick={testSignUp} 
            disabled={loading}
            className="mr-2"
          >
            {loading ? 'Testing...' : 'Test Sign Up'}
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Direct User Creation (Bypasses Auth)</h3>
          <div className="space-y-3 mb-3">
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Leave blank for random email"
                className="max-w-md"
              />
            </div>
            <div>
              <Label htmlFor="password">Password (optional)</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for default password"
                className="max-w-md"
              />
            </div>
          </div>
          <Button 
            onClick={testDirectUser}
            disabled={loading}
            className="mr-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Direct User'}
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Database Tests</h3>
          <Button 
            onClick={testPublicAccess} 
            disabled={loading}
            variant="outline"
            className="mr-2"
          >
            Test Public Access
          </Button>
          
          <Button 
            onClick={listAllTables} 
            disabled={loading}
            variant="secondary"
            className="mr-2"
          >
            List All Tables
          </Button>
          
          <Button 
            onClick={findProfilesByEmail} 
            disabled={loading}
            variant="outline"
            className="mr-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
          >
            Find Profiles By Email
          </Button>
          
          <Button 
            onClick={cleanupDuplicateProfiles} 
            disabled={loading}
            variant="outline"
            className="mr-2 bg-red-100 hover:bg-red-200 text-red-800"
          >
            Clean Up Duplicates
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
        
        {rawResponse && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Raw Response:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(rawResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest; 
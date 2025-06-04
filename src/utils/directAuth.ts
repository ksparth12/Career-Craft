/**
 * Direct Auth Utilities
 * 
 * This module provides functions for handling "direct users" - users that were created directly
 * in the database (bypassing Supabase Auth) because of persistent auth issues.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if there is a direct user logged in
 */
export const isDirectUserLoggedIn = (): boolean => {
  return !!localStorage.getItem('directUserId');
};

/**
 * Gets the current direct user information
 */
export const getDirectUser = () => {
  const id = localStorage.getItem('directUserId');
  const email = localStorage.getItem('directUserEmail');
  const role = localStorage.getItem('directUserRole');
  
  if (!id || !email) return null;
  
  return {
    id,
    email,
    role: role || 'job_seeker',
    isDirectUser: true
  };
};

/**
 * Logs out a direct user by clearing localStorage
 */
export const directUserLogout = () => {
  localStorage.removeItem('directUserId');
  localStorage.removeItem('directUserEmail');
  localStorage.removeItem('directUserRole');
};

/**
 * Simple direct login with only email (no password verification)
 * For use as a fallback when OAuth is not configured
 * @param email User email
 * @returns boolean success
 */
export const directUserLogin = (email: string): boolean => {
  try {
    // Generate a consistent user ID from the email
    const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    
    // Store user info in localStorage
    localStorage.setItem('directUserId', userId);
    localStorage.setItem('directUserEmail', email);
    localStorage.setItem('directUserRole', 'job_seeker');
    
    console.log(`Direct login successful for: ${email}`);
    return true;
  } catch (error) {
    console.error("Direct login error:", error);
    return false;
  }
};

/**
 * Logs in a direct user with email/password
 * This checks against public_profiles table
 * @param email User email
 * @param password User password (must match what was created during signup)
 */
export const directUserLoginWithPassword = async (email: string, password: string) => {
  try {
    console.log(`Trying to find user with email: ${email}`);
    
    // Check if user exists in public_profiles (using limit instead of single to avoid error with multiple records)
    const { data, error } = await supabase
      .from('public_profiles')
      .select('id, role, email, password')
      .eq('email', email)
      .limit(1);
    
    console.log("Query result:", data, error);
    
    if (error) {
      console.error("Error finding direct user:", error);
      return {
        success: false,
        error: "Error accessing user database"
      };
    }
    
    if (!data || data.length === 0) {
      console.error("No matching user found for email:", email);
      return {
        success: false,
        error: "Invalid credentials or user not found"
      };
    }
    
    // Use the first matching record
    const userRecord = data[0];
    console.log("Found user record:", userRecord);
    
    // Actually verify the password
    if (!userRecord.password || userRecord.password !== password) {
      console.error("Password does not match for user:", email);
      return {
        success: false,
        error: "Invalid credentials or user not found"
      };
    }
    
    // Store user info in localStorage
    localStorage.setItem('directUserId', userRecord.id);
    localStorage.setItem('directUserEmail', email);
    localStorage.setItem('directUserRole', userRecord.role || 'job_seeker');
    
    return {
      success: true,
      user: {
        id: userRecord.id,
        email,
        role: userRecord.role || 'job_seeker',
        isDirectUser: true
      }
    };
  } catch (error) {
    console.error("Direct login error:", error);
    return {
      success: false,
      error: "An error occurred during login"
    };
  }
};

export default {
  isDirectUserLoggedIn,
  getDirectUser,
  directUserLogin,
  directUserLoginWithPassword,
  directUserLogout
}; 
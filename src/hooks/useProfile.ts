import { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { useAuth } from './useAuth';

// ─── Admin Emails ─────────────────────────────────────
const ADMIN_EMAILS = [
  'aigencyautomata@gmail.com',
  'schuyler@aigencyautomata.com',
  'schuylerwhet@me.com',
];

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'client';
  created_at: string;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated || !user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const email = user.email?.toLowerCase() || '';
      const shouldBeAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email);

      try {
        // Try to get profile (PK is user_id, not id)
        const profiles = await blink.db.table<UserProfile>('user_profiles').list({
          where: { user_id: user.id },
          limit: 1
        });
        let userProfile: UserProfile | null = profiles.length > 0 ? profiles[0] : null;

        // If profile doesn't exist, create it
        if (!userProfile) {
          userProfile = await blink.db.table<UserProfile>('user_profiles').create({
            user_id: user.id,
            email: user.email!,
            display_name: user.displayName || user.email!.split('@')[0],
            role: shouldBeAdmin ? 'admin' : 'client'
          }) as UserProfile;
        } else if (shouldBeAdmin && userProfile.role !== 'admin') {
          // Upgrade existing profile to admin if email is in admin list
          userProfile = await blink.db.table<UserProfile>('user_profiles').update(
            userProfile.user_id,
            { role: 'admin' }
          ) as UserProfile;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user, isAuthenticated]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const updated = await blink.db.table<UserProfile>('user_profiles').update(profile.user_id, data);
    setProfile(updated as UserProfile);
    return updated;
  };

  const isAdminEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === (user?.email?.toLowerCase() || ''));

  return {
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin' || isAdminEmail,
    isClient: profile?.role === 'client' && !isAdminEmail,
    updateProfile
  };
}